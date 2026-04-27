import 'package:equatable/equatable.dart';

class ChatMessage extends Equatable {
  final int id;
  final int senderId;
  final int receiverId;
  final String content;
  final int requestId;
  final bool isRead;
  final DateTime createdAt;
  final String? senderName;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.content,
    required this.requestId,
    required this.isRead,
    required this.createdAt,
    this.senderName,
  });

  @override
  List<Object?> get props => [
        id,
        senderId,
        receiverId,
        content,
        requestId,
        isRead,
        createdAt,
        senderName,
      ];
}
