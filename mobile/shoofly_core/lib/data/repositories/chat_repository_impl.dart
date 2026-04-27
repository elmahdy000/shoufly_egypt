import '../../domain/entities/chat_message.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource remoteDataSource;

  ChatRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<ChatMessage>> getMessages(int partnerId, {int? requestId}) {
    return remoteDataSource.getMessages(partnerId, requestId: requestId);
  }

  @override
  Future<ChatMessage> sendMessage({
    required int receiverId,
    required String content,
    required int requestId,
  }) {
    return remoteDataSource.sendMessage(
      receiverId: receiverId,
      content: content,
      requestId: requestId,
    );
  }

  @override
  Future<void> markAsRead(int senderId) {
    return remoteDataSource.markAsRead(senderId);
  }

  @override
  Stream<ChatMessage> getChatStream(int userId) {
    // Return the stream from remote data source
    return remoteDataSource.getChatStream();
  }
}
