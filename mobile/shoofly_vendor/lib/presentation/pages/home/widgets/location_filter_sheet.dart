import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/presentation/blocs/location/location_bloc.dart';
import 'package:shoofly_core/presentation/blocs/vendor/vendor_bloc.dart';

class LocationFilterSheet extends StatefulWidget {
  final int? initialGovernorateId;
  final int? initialCityId;

  const LocationFilterSheet({
    super.key,
    this.initialGovernorateId,
    this.initialCityId,
  });

  @override
  State<LocationFilterSheet> createState() => _LocationFilterSheetState();
}

class _LocationFilterSheetState extends State<LocationFilterSheet> {
  int? _selectedGovernorateId;
  int? _selectedCityId;

  @override
  void initState() {
    super.initState();
    _selectedGovernorateId = widget.initialGovernorateId;
    _selectedCityId = widget.initialCityId;
    context.read<LocationBloc>().add(LoadGovernorates());
    if (_selectedGovernorateId != null) {
      context.read<LocationBloc>().add(LoadCities(_selectedGovernorateId!));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.textDisabled.withOpacity(0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'تصفية حسب الموقع',
                style: AppTypography.h4.copyWith(fontWeight: FontWeight.w900),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedGovernorateId = null;
                    _selectedCityId = null;
                  });
                },
                child: Text(
                  'إعادة تعيين',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.error),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          BlocBuilder<LocationBloc, LocationState>(
            builder: (context, state) {
              return Column(
                children: [
                  _buildDropdown(
                    label: 'المحافظة',
                    value: _selectedGovernorateId,
                    hint: 'اختر المحافظة',
                    items: state.governorates.map((g) => DropdownMenuItem(
                      value: g.id,
                      child: Text(g.name),
                    )).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedGovernorateId = val;
                        _selectedCityId = null;
                      });
                      if (val != null) {
                        context.read<LocationBloc>().add(LoadCities(val));
                      }
                    },
                    isLoading: state.isLoading && state.governorates.isEmpty,
                  ),
                  const SizedBox(height: 16),
                  _buildDropdown(
                    label: 'المدينة / المنطقة',
                    value: _selectedCityId,
                    hint: 'اختر المدينة',
                    items: state.cities.map((c) => DropdownMenuItem(
                      value: c.id,
                      child: Text(c.name),
                    )).toList(),
                    onChanged: (val) {
                      setState(() => _selectedCityId = val);
                    },
                    isLoading: state.isLoading && _selectedGovernorateId != null,
                    enabled: _selectedGovernorateId != null,
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 32),
          ModernButton(
            text: 'تطبيق الفلتر',
            icon: Icons.filter_list_rounded,
            onPressed: () {
              context.read<VendorBloc>().add(LoadOpenRequests(
                governorateId: _selectedGovernorateId,
                cityId: _selectedCityId,
              ));
              Navigator.pop(context, {
                'governorateId': _selectedGovernorateId,
                'cityId': _selectedCityId,
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required dynamic value,
    required String hint,
    required List<DropdownMenuItem<dynamic>> items,
    required ValueChanged<dynamic> onChanged,
    bool isLoading = false,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textDisabled,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: enabled ? Colors.white : AppColors.surfaceVariant.withOpacity(0.3),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderColor),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<dynamic>(
              value: value,
              hint: Text(isLoading ? 'جاري التحميل...' : hint, style: AppTypography.bodyMedium),
              isExpanded: true,
              icon: isLoading 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(LucideIcons.chevronDown, size: 18),
              items: items,
              onChanged: enabled ? onChanged : null,
              dropdownColor: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ],
    );
  }
}
