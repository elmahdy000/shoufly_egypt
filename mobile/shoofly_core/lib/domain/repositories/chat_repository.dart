import '../../domain/entities/chat_message.dart';

abstract class ChatRepository {
  Future<List<ChatMessage>> getMessages(int partnerId, {int? requestId});
  Future<ChatMessage> sendMessage({
    required int receiverId,
    required String content,
    required int requestId,
  });
  Future<void> markAsRead(int senderId);
  Stream<ChatMessage> getChatStream(int userId);
}
