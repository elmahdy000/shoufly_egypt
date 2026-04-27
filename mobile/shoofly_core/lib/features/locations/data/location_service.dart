import 'package:shoofly_core/core/api/api_client.dart';
import 'package:shoofly_core/data/models/location_model.dart';
import 'package:shoofly_core/core/constants/egypt_locations.dart';

class LocationService {
  final ApiClient _apiClient;

  LocationService(this._apiClient);

  Future<List<GovernorateModel>> getGovernorates() async {
    try {
      final response = await _apiClient.get<List<dynamic>>(
        '/locations',
        queryParameters: {'type': 'governorates'},
      );
      return response.map((json) => GovernorateModel.fromJson(json as Map<String, dynamic>)).toList();
    } catch (e) {
      // Fallback to local data as a last resort
      return EgyptLocations.governorates.asMap().entries.map((entry) {
        return GovernorateModel(
          id: entry.key + 1,
          name: entry.value.nameEn,
          nameAr: entry.value.nameAr,
        );
      }).toList();
    }
  }

  Future<List<CityModel>> getCities(int governorateId) async {
    try {
      final response = await _apiClient.get<List<dynamic>>(
        '/locations',
        queryParameters: {'type': 'cities', 'governorateId': governorateId},
      );
      return response.map((json) => CityModel.fromJson(json as Map<String, dynamic>)).toList();
    } catch (e) {
      // Fallback to local data
      final index = governorateId - 1;
      if (index >= 0 && index < EgyptLocations.governorates.length) {
        final gov = EgyptLocations.governorates[index];
        return gov.cities.asMap().entries.map((entry) {
          return CityModel(
            id: (governorateId * 100) + entry.key,
            governorateId: governorateId,
            name: entry.value,
            nameAr: entry.value,
          );
        }).toList();
      }
      return [];
    }
  }
}
