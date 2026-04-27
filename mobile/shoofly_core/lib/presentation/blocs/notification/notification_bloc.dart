import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/di/injection.dart';
import '../../../features/notifications/data/notification_stream_service.dart' as notification_service;

// --- Events ---
abstract class NotificationEvent extends Equatable {
  const NotificationEvent();
  @override
  List<Object?> get props => [];
}

class StartNotificationStream extends NotificationEvent {}
class StopNotificationStream extends NotificationEvent {}
class NewNotificationReceived extends NotificationEvent {
  final notification_service.NotificationEvent notification;
  const NewNotificationReceived(this.notification);
  @override
  List<Object?> get props => [notification];
}
class MarkAsRead extends NotificationEvent {
  final String notificationId;
  const MarkAsRead(this.notificationId);
  @override
  List<Object?> get props => [notificationId];
}

/// Internal event emitted when the stream closes or errors.
class _NotificationStreamFailed extends NotificationEvent {
  final String reason;
  const _NotificationStreamFailed(this.reason);
  @override
  List<Object?> get props => [reason];
}

// --- States ---
abstract class NotificationState extends Equatable {
  const NotificationState();
  @override
  List<Object?> get props => [];
}

class NotificationInitial extends NotificationState {}
class NotificationStreamActive extends NotificationState {}
class NotificationsUpdated extends NotificationState {
  final List<notification_service.NotificationEvent> notifications;
  final int unreadCount;
  final notification_service.NotificationEvent? latestNotification;
  const NotificationsUpdated({
    required this.notifications,
    required this.unreadCount,
    this.latestNotification,
  });
  @override
  List<Object?> get props => [notifications, unreadCount, latestNotification];
}
class NotificationStreamError extends NotificationState {
  final String message;
  const NotificationStreamError(this.message);
  @override
  List<Object?> get props => [message];
}

// --- Bloc ---
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final notification_service.NotificationStreamService _streamService;
  StreamSubscription? _streamSubscription;
  final List<notification_service.NotificationEvent> _notifications = [];

  NotificationBloc() : 
    _streamService = sl<notification_service.NotificationStreamService>(),
    super(NotificationInitial()) {
    on<StartNotificationStream>(_onStartStream);
    on<StopNotificationStream>(_onStopStream);
    on<NewNotificationReceived>(_onNewNotification);
    on<MarkAsRead>(_onMarkAsRead);
    on<_NotificationStreamFailed>(_onStreamFailed);
  }

  Future<void> _onStartStream(StartNotificationStream event, Emitter<NotificationState> emit) async {
    await _streamService.start();

    // Listen to SSE stream
    _streamSubscription?.cancel();
    _streamSubscription = _streamService.stream.listen(
      (notification) {
        if (!isClosed) add(NewNotificationReceived(notification));
      },
      onError: (error) {
        if (!isClosed && error is notification_service.NotificationError) {
          add(_NotificationStreamFailed(error.message));
        }
      },
      onDone: () {
        // Stream closed (e.g. server reset). The service already schedules
        // a reconnect internally; just update state so the UI can reflect it.
        if (!isClosed) add(_NotificationStreamFailed('انقطع الاتصال. جارٍ إعادة المحاولة...'));
      },
      cancelOnError: false,
    );

    emit(NotificationStreamActive());
  }

  Future<void> _onStopStream(StopNotificationStream event, Emitter<NotificationState> emit) async {
    _streamSubscription?.cancel();
    _streamService.stop();
    emit(NotificationInitial());
  }

  void _onNewNotification(NewNotificationReceived event, Emitter<NotificationState> emit) {
    _notifications.insert(0, event.notification);
    
    // Keep only last 50 notifications
    if (_notifications.length > 50) {
      _notifications.removeLast();
    }
    
    final unreadCount = _notifications.where((n) => !n.isRead).length;
    
    emit(NotificationsUpdated(
      notifications: List.from(_notifications),
      unreadCount: unreadCount,
      latestNotification: event.notification,
    ));
  }

  void _onStreamFailed(_NotificationStreamFailed event, Emitter<NotificationState> emit) {
    // Keep existing notifications visible; just signal the connectivity issue
    final currentNotifications = state is NotificationsUpdated
        ? (state as NotificationsUpdated).notifications
        : const <notification_service.NotificationEvent>[];
    final unreadCount = currentNotifications.where((n) => !n.isRead).length;
    if (currentNotifications.isNotEmpty) {
      emit(NotificationsUpdated(
        notifications: currentNotifications,
        unreadCount: unreadCount,
      ));
    } else {
      emit(NotificationStreamError(event.reason));
    }
  }

  void _onMarkAsRead(MarkAsRead event, Emitter<NotificationState> emit) {
    // Mark notification as read locally
    final index = _notifications.indexWhere((n) => n.id == event.notificationId);
    if (index != -1) {
      // Update the notification
      _notifications[index].isRead = true;
      final unreadCount = _notifications.where((n) => !n.isRead).length;
      emit(NotificationsUpdated(
        notifications: List.from(_notifications),
        unreadCount: unreadCount,
      ));
    }
  }

  @override
  Future<void> close() {
    _streamSubscription?.cancel();
    _streamService.dispose();
    return super.close();
  }
}
