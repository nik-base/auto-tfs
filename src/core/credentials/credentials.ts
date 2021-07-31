export class Credentials {
    public userName: string | undefined;
    public password: string | undefined;

    public getUserName(): string | undefined {
        return this.userName;
    }

    public setUserName(userName: string): void {
        this.userName = userName;
    }

    public getPassword(): string | undefined {
        return this.password;
    }

    public setPassword(password: string): void {
        this.password = password;
    }
}
