import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:shoofly_core/domain/entities/chat_message.dart';
import 'package:shoofly_core/domain/repositories/chat_repository.dart';

// Events
abstract class ChatEvent extends Equatable {
  const ChatEvent();
  @override
  List<Object?> get props => [];
}

class LoadMessages extends ChatEvent {
  final int partnerId;
  final int? requestId;
  LoadMessages(this.partnerId, {this.requestId});
  @override
  List<Object?> get props => [partnerId, requestId];
}

class StartChatPolling extends ChatEvent {
  final int partnerId;
  final int requestId;
  const StartChatPolling({required this.partnerId, required this.requestId});
  @override
  List<Object?> get props => [partnerId, requestId];
}

class StopChatPolling extends ChatEvent {}

class _PollMessages extends ChatEvent {
  final int partnerId;
  final int requestId;
  const _PollMessages({required this.partnerId, required this.requestId});
  @override
  List<Object?> get props => [partnerId, requestId];
}

class SendChatMessage extends ChatEvent {
  final int receiverId;
  final String content;
  final int requestId;
  SendChatMessage({required this.receiverId, required this.content, required this.requestId});
  @override
  List<Object?> get props => [receiverId, content, requestId];
}

class MessageReceived extends ChatEvent {
  final ChatMessage message;
  MessageReceived(this.message);
  @override
  List<Object?> get props => [message];
}

// State
abstract class ChatState extends Equatable {
  const ChatState();
  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}

class ChatLoading extends ChatState {}

class ChatMessagesLoaded extends ChatState {
  final List<ChatMessage> messages;
  const ChatMessagesLoaded(this.messages);
  @override
  List<Object?> get props => [messages];
}

class ChatError extends ChatState {
  final String message;
  const ChatError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository repository;
  Timer? _pollingTimer;
  static const _pollInterval = Duration(seconds: 5);

  ChatBloc({required this.repository}) : super(ChatInitial()) {
    on<LoadMessages>(_onLoadMessages);
    on<StartChatPolling>(_onStartPolling);
    on<StopChatPolling>(_onStopPolling);
    on<_PollMessages>(_onPollMessages);
    on<SendChatMessage>(_onSendMessage);
    on<MessageReceived>(_onMessageReceived);
  }

  Future<void> _onLoadMessages(LoadMessages event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final messages = await repository.getMessages(event.partnerId, requestId: event.requestId);
      emit(ChatMessagesLoaded(messages));
    } catch (e) {
      emit(ChatError(e.toString()));
    }
  }

  Future<void> _onStartPolling(StartChatPolling event, Emitter<ChatState> emit) async {
    _pollingTimer?.cancel();

    // Initial load
    try {
      final messages = await repository.getMessages(event.partnerId, requestId: event.requestId);
      emit(ChatMessagesLoaded(messages));
      // Mark as read after loading
      await repository.markAsRead(event.partnerId);
    } catch (e) {
      emit(ChatError(e.toString()));
    }

    // Start periodic polling
    _pollingTimer = Timer.periodic(_pollInterval, (_) {
      if (!isClosed) {
        add(_PollMessages(partnerId: event.partnerId, requestId: event.requestId));
      }
    });
  }

  Future<void> _onStopPolling(StopChatPolling event, Emitter<ChatState> emit) async {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> _onPollMessages(_PollMessages event, Emitter<ChatState> emit) async {
    try {
      final messages = await repository.getMessages(event.partnerId, requestId: event.requestId);
      final currentMessages = state is ChatMessagesLoaded
          ? (state as ChatMessagesLoaded).messages
          : <ChatMessage>[];

      // Only emit if there are new messages (avoid unnecessary rebuilds)
      if (messages.length != currentMessages.length ||
          (messages.isNotEmpty && currentMessages.isNotEmpty &&
              messages.last.id != currentMessages.last.id)) {
        emit(ChatMessagesLoaded(messages));
        // Mark new messages as read
        await repository.markAsRead(event.partnerId);
      }
    } catch (e) {
      // Non-critical polling error — log only, keep showing existing messages
      debugPrint('ChatBloc: polling error $e');
    }
  }

  Future<void> _onSendMessage(SendChatMessage event, Emitter<ChatState> emit) async {
    final currentMessages = state is ChatMessagesLoaded
        ? List<ChatMessage>.from((state as ChatMessagesLoaded).messages)
        : <ChatMessage>[];
    try {
      final newMessage = await repository.sendMessage(
        receiverId: event.receiverId,
        content: event.content,
        requestId: event.requestId,
      );
      emit(ChatMessagesLoaded([...currentMessages, newMessage]));
    } catch (e) {
      // Re-emit current messages so the UI stays visible, but show error via a new state
      emit(ChatMessagesLoaded(currentMessages));
      emit(ChatError(e.toString()));
    }
  }

  void _onMessageReceived(MessageReceived event, Emitter<ChatState> emit) {
    if (state is ChatMessagesLoaded) {
      final currentMessages = (state as ChatMessagesLoaded).messages;
      // Avoid duplicates
      final alreadyExists = currentMessages.any((m) => m.id == event.message.id);
      if (!alreadyExists) {
        emit(ChatMessagesLoaded([...currentMessages, event.message]));
      }
    }
  }

  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    return super.close();
  }
}
