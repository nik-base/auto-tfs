export class Credentials {
    userName: string;
    password: string;
    
    public getUserName() : string {
        return this.userName;
    }

    public setUserName(userName : string) : void {
        this.userName = userName;
    }

    public getPassword() : string {
        return this.password;
    }

    public setPassword(password : string) : void {
        this.password = password;
    }
}
