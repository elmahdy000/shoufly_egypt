import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/config/app_config.dart';
import '../../../core/storage/token_storage.dart';

/// Service for handling Server-Sent Events (SSE) notifications
/// Connects to the backend notification stream endpoint
class NotificationStreamService {
  HttpClient? _client;
  StreamSubscription? _subscription;
  final _controller = StreamController<NotificationEvent>.broadcast();
  Timer? _reconnectTimer;
  bool _isConnected = false;
  bool _shouldReconnect = true;
  int _reconnectAttempts = 0;
  // After _maxReconnectAttempts fast retries, switch to a longer delay (exponential backoff cap).
  static const _maxFastAttempts = 5;
  static const _fastDelay = Duration(seconds: 5);
  static const _slowDelay = Duration(seconds: 60);

  /// Stream of notification events
  Stream<NotificationEvent> get stream => _controller.stream;

  /// Check if currently connected
  bool get isConnected => _isConnected;

  /// Start listening to the notification stream
  /// Only starts if user is authenticated
  Future<void> start() async {
    // Check if user is authenticated before starting
    final isAuthenticated = await TokenStorage.isLoggedIn();
    if (!isAuthenticated) {
      debugPrint('NotificationStream: Not starting - user not authenticated');
      return;
    }

    if (_isConnected) {
      debugPrint('NotificationStream: Already connected');
      return;
    }

    await _connect();
  }

  /// Connect to SSE endpoint
  Future<void> _connect() async {
    try {
      final token = await TokenStorage.getAccessToken();
      if (token == null) {
        debugPrint('NotificationStream: No token available');
        return;
      }

      _client?.close();
      _client = HttpClient();

      final url = Uri.parse('${AppConfig.fullApiUrl}${ApiEndpoints.notificationStream}');
      final request = await _client!.getUrl(url);
      request.headers.set('Authorization', 'Bearer $token');
      request.headers.set('Accept', 'text/event-stream');
      request.headers.set('Cache-Control', 'no-cache');

      debugPrint('NotificationStream: Connecting to $url');
      final response = await request.close();

      if (response.statusCode == 200) {
        _isConnected = true;
        _reconnectAttempts = 0;
        debugPrint('NotificationStream: Connected successfully');

        _subscription = response
            .transform(utf8.decoder)
            .transform(const LineSplitter())
            .listen(
              _onEvent,
              onError: _onError,
              onDone: _onDone,
              cancelOnError: false,
            );
      } else {
        debugPrint('NotificationStream: Connection failed with status ${response.statusCode}');
        _scheduleReconnect();
      }
    } catch (e) {
      debugPrint('NotificationStream: Connection error - $e');
      _scheduleReconnect();
    }
  }

  /// Handle incoming SSE event
  void _onEvent(String line) {
    if (line.isEmpty || line.startsWith(':')) {
      return;
    }

    debugPrint('NotificationStream: Received event payload');
    
    // SSE format: "data: {json}"
    if (line.startsWith('data:')) {
      try {
        final jsonStr = line.substring(5).trim();
        final data = json.decode(jsonStr) as Map<String, dynamic>;
        final event = NotificationEvent.fromJson(data);
        _controller.add(event);
      } catch (e) {
        debugPrint('NotificationStream: Error parsing event - $e');
      }
    }
  }

  /// Handle stream error
  void _onError(Object error) {
    debugPrint('NotificationStream: Stream error - $error');
    _isConnected = false;
    _scheduleReconnect();
  }

  /// Handle stream close
  void _onDone() {
    debugPrint('NotificationStream: Stream closed');
    _isConnected = false;
    if (_shouldReconnect) {
      _scheduleReconnect();
    }
  }

  /// Schedule reconnection attempt — never permanently stops.
  /// First [_maxFastAttempts] retries use exponential backoff up to 25s,
  /// then switches to a steady [_slowDelay] so the app recovers when
  /// connectivity returns after a long outage.
  void _scheduleReconnect() {
    if (!_shouldReconnect) return;

    _reconnectTimer?.cancel();
    _reconnectAttempts++;

    final Duration delay;
    if (_reconnectAttempts <= _maxFastAttempts) {
      delay = _fastDelay * _reconnectAttempts; // 5s, 10s, 15s, 20s, 25s
    } else {
      delay = _slowDelay; // 60s steady thereafter
    }

    debugPrint(
      'NotificationStream: Reconnecting in ${delay.inSeconds}s '
      '(attempt $_reconnectAttempts)',
    );

    _reconnectTimer = Timer(delay, () {
      if (_shouldReconnect) {
        _connect();
      }
    });
  }

  /// Stop the notification stream (can be restarted via [start]).
  void stop() {
    debugPrint('NotificationStream: Stopping');
    _shouldReconnect = false;
    _reconnectAttempts = 0;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _subscription?.cancel();
    _subscription = null;
    _client?.close(force: true);
    _client = null;
    _isConnected = false;
  }

  /// Restart the stream after [stop] was called.
  Future<void> restart() async {
    _shouldReconnect = true;
    await start();
  }

  /// Dispose the service
  void dispose() {
    stop();
    _controller.close();
  }
}

/// Notification event model
class NotificationEvent {
  final String id;
  final String type;
  final String title;
  final String? message;
  final String? requestId;
  final DateTime createdAt;
  final Map<String, dynamic>? data;
  bool isRead;

  NotificationEvent({
    required this.id,
    required this.type,
    required this.title,
    this.message,
    this.requestId,
    required this.createdAt,
    this.data,
    this.isRead = false,
  });

  factory NotificationEvent.fromJson(Map<String, dynamic> json) {
    return NotificationEvent(
      id: json['id']?.toString() ?? '',
      type: json['type'] as String? ?? 'general',
      title: json['title'] as String? ?? 'إشعار جديد',
      message: json['message'] as String?,
      requestId: json['requestId']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      data: json['data'] as Map<String, dynamic>?,
    );
  }

  /// Check if this is a bid notification
  bool get isBidNotification => type == 'NEW_BID';

  /// Check if this is a request status change
  bool get isStatusChange => type == 'STATUS_CHANGE';

  /// Check if this is a message notification
  bool get isMessage => type == 'NEW_MESSAGE';
}

/// Notification error
class NotificationError {
  final String message;
  NotificationError(this.message);
}
