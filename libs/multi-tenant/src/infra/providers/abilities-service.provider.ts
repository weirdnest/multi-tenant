import { AbilitiesService } from '../../core/abilities/abilities.service';
import { IAbilitiesService } from '../../core/abilities/interfaces/abilities-service.interface';

export const AbilitiesServiceProvider = {
  provide: IAbilitiesService,
  useClass: AbilitiesService,
};
