# First steps

To be able to use the library and it's methods, you just need to create a new keycloak facade

```ts
import createKeycloakFacade from 'keycloak-typescript';

const keycloakFacade = await createKeycloakFacade(
    {
        clientId: 'client-id',
        clientSecret: 'client-secret',
        username: 'username',
        password: 'password'
    },
    'YOUR-KEYCLOAK-REALM',
    'YOUR-BASE-KEYCLOAK-URL' //Example: http://localhost:8000
    true //Set this parameter to true if your keycloak version is equal or higher to 17, otherwise, set this parameter to false
);

const newUserId = this.keycloakFacade.userManager.create({ // Use example of the user manager to create a new user
    user.email,
    user.username,
    user.enabled,
    user.firstname,
    user.lastname,
    user.password    
});
```

## Managers

### User Manager

The following are methods that affects the users context.

#### getUserId(username: string): Promise<string>

This method returns the user id of a given username (useful since every other method of this manager requires the USER ID, not the USERNAME).

```ts
try{
    const userId = await keycloakFacade.userManager.getUserId('example_username');
}catch(error){
    //Error
}
```

#### get(userId: string): Promise<User>;
    
Returns all the all the data of a user contained in the [Keycloak user model](https://github.com/krasamo/keycloak-typescript/blob/main/src/models/user.ts)

```ts
try{
    const userData = await keycloakFacade.userManager.get('3xamp1e-us3r-1d');
}catch(error){
    //Error
}
```

#### create(...): Promise<string>;
    
Creates a new user with the given parameters and returns the user id of that new user.

```ts
try{
    const newUserId = this.keycloakFacade.userManager.create({
        user.email,
        user.username,
        user.enabled,
        user.firstname,
        user.lastname,
        user.password,
        true/false // If this argument is set to true, and you have a mail server configured in your keycloak server, then a verification email will be sent to the new user's email
    });
}catch(error){
    //Error
}
```

#### modify(userId: string, user: User, isReplaceOperation: boolean): Promise<User>;
    
Concatenates/replaces (according to the 'isReplaceOperation' parameter value) user's data with the data passed in the 'user' parameter, and returns the modified user.

```ts
try{
    const preModifiedUser: User = await keycloakFacade.userManager.get('a-user-id'); // --> user: {id: 'a-user-id', realmRoles:['rr1', 'rr2'], clientRoles: [['client1', ['c1role']]]}
    
    const userDataToAppend: User = {
        clientRoles: new Map<string, string[]>([
            ['client2', ['c2role']]
        ]),
        realmRoles: ['rr3']
    };
    
    const postModifiedUserConcatenated: User = await keycloakFacade.userManager.modify(
        'a-user-id',
        userDataToAppend,
        false // Since this parameter is set to false, the user parameter will be APPENDED to the user with that user id
        ); // --> user: {id: 'a-user-id', realmRoles:['rr1', 'rr2', 'rr3'], clientRoles: [['client1', ['c1role']], ['client2', ['c2role']]]}
        
    const postModifiedUserReplaced: User = await keycloakFacade.userManager.modify(
        'a-user-id',
        userDataToAppend,
        true // Since this parameter is set to true, the user with the specified user id will be REPLACED with the user parameter
        ); // --> user: {id: 'a-user-id', realmRoles:['rr3'], clientRoles: [['client2', ['c2role']]]}
}catch(error){
    //Error
}
```

**WARNING**: Please be careful with the value that you send to the 'isReplaceOperation' parameter, since **a replace operation will erase all previous data from a user**.

#### resetPassword(userId: string, newPassword: string, isTemporary: boolean): Promise<void>;
    
Reset current user's password with the 'newPassword' parameter.
    
```ts
try{
    await keycloakFacade.userManager.resetPassword(
    'a-user-id',
    'a-sus-new-password',
    true //--> Since this parameter is set to true, the new password will be temporary, and the user will have to change it in their next login.
    );
    
    await keycloakFacade.userManager.resetPassword(
    'a-user-id',
    'a-sus-new-password',
    false //--> Since this parameter is set to false, the new password will not be temporary, and the user will not have to change it in their next login.
    ); 
}catch(error){
    //Error
}
```