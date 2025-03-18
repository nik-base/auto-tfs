/* eslint-disable @typescript-eslint/member-ordering */
import { Configuration } from './configuration';

export class TfsLocaleConfiguration {
    private readonly language = new Configuration()?.getTfLanguage() || 'English';

    private readonly regexLocales: {
        Change: Record<string, string>;
        LocalItem: Record<string, string>;
        Add: Record<string, string>;
        Delete: Record<string, string>;
        Rename: Record<string, string>;
        Edit: Record<string, string>;
        SourceItem: Record<string, string>;
        Collection: Record<string, string>;
    } = {
            Change: {
                'en': 'Change',
                'es': 'Cambiar',
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
            SourceItem: {
                en: 'Source item',
                es: 'Elemento de origen',
            },
            Collection: {
                en: 'Collection',
                es: 'Colecci[\\s\\S]?',
            },
        };

    private readonly localeMap: Record<string, string> = {
        English: 'en',
        Spanish: 'es',
    };

    private readonly locale = this.localeMap[this.language];

    readonly changeRegex = this.regexLocales.Change[this.locale];

    readonly localItemRegex = this.regexLocales.LocalItem[this.locale];

    readonly sourceItemRegex = this.regexLocales.SourceItem[this.locale];

    readonly collectionRegex = this.regexLocales.Collection[this.locale];

    readonly addRegex = this.regexLocales.Add[this.locale];

    readonly deleteRegex = this.regexLocales.Delete[this.locale];

    readonly renameRegex = this.regexLocales.Rename[this.locale];

    readonly editRegex = this.regexLocales.Edit[this.locale];
}