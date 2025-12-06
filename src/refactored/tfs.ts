
import * as azdev from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export class TfsApi {
    private connection: azdev.WebApi;

    constructor(serverUrl: string, accessToken: string) {
        const authHandler = azdev.getPersonalAccessTokenHandler(accessToken);
        this.connection = new azdev.WebApi(serverUrl, authHandler);
    }

    public async getProjects(): Promise<TeamProject[]> {
        const coreApi = await this.connection.getCoreApi();
        return coreApi.getProjects();
    }

    public async getGitApi(): Promise<IGitApi> {
        return this.connection.getGitApi();
    }
}
