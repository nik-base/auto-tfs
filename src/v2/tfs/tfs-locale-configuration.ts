import { AutoTFSConfiguration } from '../core/autotfs-configuration';

export class TFSLocaleConfiguration {
  private static readonly language = AutoTFSConfiguration.tfLanguage;

  private static readonly regexLocales: {
    Change: Record<string, string>;
    LocalItem: Record<string, string>;
    Add: Record<string, string>;
    Delete: Record<string, string>;
    Rename: Record<string, string>;
    Edit: Record<string, string>;
    SourceItem: Record<string, string>;
    Items: Record<string, string>;
    ServerPath: Record<string, string>;
    Collection: Record<string, string>;
  } = {
    Change: {
      en: 'Change',
      es: 'Cambiar',
    },
    LocalItem: {
      en: 'Local item',
      es: 'Elemento local',
    },
    Add: {
      en: 'add',
      es: 'agregar',
    },
    Delete: {
      en: 'delete',
      es: 'eliminar',
    },
    Rename: {
      en: 'rename',
      es: 'renonmbrar',
    },
    Edit: {
      en: 'edit',
      es: 'editar',
    },
    Items: {
      en: 'Items',
      es: 'Elementos',
    },
    SourceItem: {
      en: 'Source item',
      es: 'Elemento de origen',
    },
    ServerPath: {
      en: 'Server path',
      es: 'Ruta de acceso del servidor',
    },
    Collection: {
      en: 'Collection',
      es: 'Colecci[\\s\\S]?',
    },
  };

  private static readonly localeMap: Record<string, string> = {
    English: 'en',
    Spanish: 'es',
  };

  private static readonly locale = this.localeMap[this.language];

  static readonly changeRegex = this.regexLocales.Change[this.locale];

  static readonly itemsRegex = this.regexLocales.Items[this.locale];

  static readonly localItemRegex = this.regexLocales.LocalItem[this.locale];

  static readonly sourceItemRegex = this.regexLocales.SourceItem[this.locale];

  static readonly serverPathRegex = this.regexLocales.ServerPath[this.locale];

  static readonly collectionRegex = this.regexLocales.Collection[this.locale];

  static readonly addRegex = this.regexLocales.Add[this.locale];

  static readonly deleteRegex = this.regexLocales.Delete[this.locale];

  static readonly renameRegex = this.regexLocales.Rename[this.locale];

  static readonly editRegex = this.regexLocales.Edit[this.locale];
}
