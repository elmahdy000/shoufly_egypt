import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dartz/dartz.dart';
import 'package:shoofly_core/core/errors/failures.dart';
import 'package:shoofly_core/domain/entities/wallet.dart';
import 'package:shoofly_core/domain/entities/wallet_transaction.dart';
import 'package:shoofly_core/domain/repositories/wallet_repository.dart';

// --- Events ---
abstract class WalletEvent extends Equatable {
  const WalletEvent();
  @override
  List<Object?> get props => [];
}

class LoadWalletBalance extends WalletEvent {}

class TopUpWallet extends WalletEvent {
  final double amount;
  const TopUpWallet(this.amount);
  @override
  List<Object?> get props => [amount];
}

class LoadWalletTransactions extends WalletEvent {}

class PaymentSuccess extends WalletEvent {
  const PaymentSuccess();
}

// --- States ---
abstract class WalletState extends Equatable {
  const WalletState();
  @override
  List<Object?> get props => [];
}

class WalletInitial extends WalletState {}
class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final Wallet wallet;
  /// Recent transactions (up to 5). Empty list means not yet loaded.
  final List<WalletTransaction> recentTransactions;
  const WalletLoaded(this.wallet, {this.recentTransactions = const []});
  @override
  List<Object?> get props => [wallet, recentTransactions];
}

class WalletTransactionsLoaded extends WalletState {
  final List<WalletTransaction> transactions;
  const WalletTransactionsLoaded(this.transactions);
  @override
  List<Object?> get props => [transactions];
}

class WalletTopUpRedirect extends WalletState {
  final String redirectUrl;
  final Wallet? previousWallet;
  const WalletTopUpRedirect(this.redirectUrl, {this.previousWallet});
  @override
  List<Object?> get props => [redirectUrl, previousWallet];
}

class WalletAwaitingPaymentConfirmation extends WalletState {
  final Wallet wallet;
  const WalletAwaitingPaymentConfirmation(this.wallet);
  @override
  List<Object?> get props => [wallet];
}

class WalletError extends WalletState {
  final String message;
  const WalletError(this.message);
  @override
  List<Object?> get props => [message];
}

// --- Bloc ---
class WalletBloc extends Bloc<WalletEvent, WalletState> {
  final WalletRepository repository;

  WalletBloc({required this.repository}) : super(WalletInitial()) {
    on<LoadWalletBalance>(_onLoadWalletBalance);
    on<TopUpWallet>(_onTopUpWallet);
    on<LoadWalletTransactions>(_onLoadWalletTransactions);
    on<PaymentSuccess>(_onPaymentSuccess);
  }

  Future<void> _onLoadWalletBalance(
    LoadWalletBalance event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    // Load balance + recent transactions in parallel — single render pass
    final results = await Future.wait([
      repository.getBalance(),
      repository.getTransactions(),
    ]);
    final balanceResult = results[0] as Either<Failure, Wallet>;
    final txResult = results[1] as Either<Failure, List<WalletTransaction>>;

    balanceResult.fold(
      (failure) => emit(WalletError(failure.message)),
      (wallet) {
        final recentTx = txResult.fold(
          (_) => <WalletTransaction>[],
          (txs) => (txs as List<WalletTransaction>).take(5).toList(),
        );
        emit(WalletLoaded(wallet, recentTransactions: recentTx));
      },
    );
  }

  Future<void> _onLoadWalletTransactions(
    LoadWalletTransactions event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    final result = await repository.getTransactions();
    result.fold(
      (failure) => emit(WalletError(failure.message)),
      (transactions) => emit(WalletTransactionsLoaded(transactions)),
    );
  }

  Future<void> _onTopUpWallet(
    TopUpWallet event,
    Emitter<WalletState> emit,
  ) async {
    if (event.amount <= 0) {
      emit(const WalletError('المبلغ يجب أن يكون أكبر من صفر'));
      return;
    }

    Wallet? currentWallet;
    List<WalletTransaction> currentRecentTx = const [];
    if (state is WalletLoaded) {
      currentWallet = (state as WalletLoaded).wallet;
      currentRecentTx = (state as WalletLoaded).recentTransactions;
    }

    emit(WalletLoading());
    final result = await repository.topUp(event.amount);

    result.fold(
      (failure) {
        emit(WalletError(failure.message));
        if (currentWallet != null) {
          emit(WalletLoaded(currentWallet, recentTransactions: currentRecentTx));
        }
      },
      (redirectUrl) {
        emit(WalletTopUpRedirect(redirectUrl, previousWallet: currentWallet));
      },
    );
  }

  Future<void> _onPaymentSuccess(
    PaymentSuccess event,
    Emitter<WalletState> emit,
  ) async {
    emit(WalletLoading());
    // Reload both balance and recent transactions after a successful payment
    final results = await Future.wait([
      repository.getBalance(),
      repository.getTransactions(),
    ]);
    final balanceResult = results[0] as Either<Failure, Wallet>;
    final txResult = results[1] as Either<Failure, List<WalletTransaction>>;

    balanceResult.fold(
      (failure) => emit(WalletError(failure.message)),
      (wallet) {
        final recentTx = txResult.fold(
          (_) => <WalletTransaction>[],
          (txs) => (txs as List<WalletTransaction>).take(5).toList(),
        );
        emit(WalletLoaded(wallet, recentTransactions: recentTx));
      },
    );
  }
}
