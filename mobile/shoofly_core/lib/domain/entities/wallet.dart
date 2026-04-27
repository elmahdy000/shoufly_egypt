import 'package:equatable/equatable.dart';

class Wallet extends Equatable {
  final double balance;

  const Wallet({required this.balance});

  @override
  List<Object?> get props => [balance];
}
