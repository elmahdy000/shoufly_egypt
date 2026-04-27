import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/chat_message_model.dart';
import '../../core/errors/exceptions.dart';

abstract class ChatRemoteDataSource {
  Future<List<ChatMessageModel>> getMessages(int partnerId, {int? requestId});
  Future<ChatMessageModel> sendMessage({
    required int receiverId,
    required String content,
    required int requestId,
  });
  Future<void> markAsRead(int senderId);
  Stream<ChatMessageModel> getChatStream();
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final Dio dio;

  ChatRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<ChatMessageModel>> getMessages(int partnerId, {int? requestId}) async {
    try {
      final queryParams = <String, dynamic>{'otherId': partnerId};
      if (requestId != null) queryParams['requestId'] = requestId;

      final response = await dio.get('/chat', queryParameters: queryParams);

      final data = response.data;
      if (data == null) return [];
      if (data is! List) {
        debugPrint('ChatDataSource.getMessages: unexpected response type ${data.runtimeType}');
        return [];
      }

      return data
          .whereType<Map<String, dynamic>>()
          .map((json) => ChatMessageModel.fromJson(json))
          .toList();
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response!.data as Map)['error'] as String? ?? 'فشل في تحميل الرسائل'
          : 'فشل في تحميل الرسائل';
      throw ServerException(message: errorMsg);
    }
  }

  @override
  Future<ChatMessageModel> sendMessage({
    required int receiverId,
    required String content,
    required int requestId,
  }) async {
    try {
      final response = await dio.post('/chat', data: {
        'receiverId': receiverId,
        'content': content,
        'requestId': requestId,
      });
      return ChatMessageModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response!.data as Map)['error'] as String? ?? 'فشل في إرسال الرسالة'
          : 'فشل في إرسال الرسالة';
      throw ServerException(message: errorMsg);
    }
  }

  @override
  Future<void> markAsRead(int senderId) async {
    try {
      await dio.patch('/chat', data: {'senderId': senderId});
    } on DioException catch (e) {
      // Non-critical — log but don't rethrow
      debugPrint('ChatDataSource.markAsRead: DioException ${e.message}');
    } catch (e) {
      debugPrint('ChatDataSource.markAsRead: unexpected error $e');
    }
  }

  /// Real-time chat is handled via polling in ChatBloc.
  /// This stream is a no-op placeholder kept for interface compatibility.
  @override
  Stream<ChatMessageModel> getChatStream() async* {
    // Polling logic lives in ChatBloc (StartChatPolling event).
  }
}
