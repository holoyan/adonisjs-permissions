# Role permissions system for AdonisJS V6+

## Beta version

[//]: # ([![test]&#40;https://github.com/holoyan/adonisjs-permissions/actions/workflows/test.yml/badge.svg&#41;]&#40;https://github.com/holoyan/adonisjs-permissions/actions/workflows/test.yml&#41;)
[![license](https://poser.pugx.org/silber/bouncer/license.svg)](https://github.com/holoyan/adonisjs-permissions/blob/master/LICENSE.md)

## Table of Contents

<details><summary>Click to expand</summary><p>

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Mixins](#mixins)
- [Support](#support)
  - [Database support](#database-support)
  - [UUID support](#uuid-support)
- [Basic Usage](#basic-usage)
  - [Creating roles and permissions](#creating-roles-and-permissions)
  - [Assigning permissions to the roles (Globally)](#assigning-permissions-to-the-roles-globally)
  - [Creating permission on a fly](#creating-permission-on-a-fly)
  - [Assigning permissions and roles to the users (models)](#assigning-permissions-and-roles-to-the-users-models)
  - [Multi-model support](#multi-model-support)
  - [Getting all roles for a user](#getting-all-roles-for-a-user)
  - [Getting all permissions for a role](#getting-all-permissions-for-a-role)
  - [Getting all permissions for a user (model)](#getting-all-permissions-for-a-user-model)
  - [Getting users (models) for a permission](#getting-users-models-for-a-permission)
  - [Getting models for a role](#getting-models-for-a-role)
  - [Checking for a permission](#checking-for-a-permission)
  - [Middleware](#middleware)
  - [Removing (revoking) roles and permissions from the model](#removing-revokingdetach-roles-and-permissions-from-the-model)
- [Digging deeper](#digging-deeper)
  - [Restricting a permission on a resource)](#restricting-a-permission-on-a-resource)
  - [Forbidding permissions](#forbidding-permissions)
  - [Forbidding permissions on a resource](#forbidding-permissions-on-a-resource)
  - [Checking for forbidden permissions](#checking-for-forbidden-permissions)
  - [Unforbidding the permissions](#unforbidding-the-permissions)
  - [Global vs resource permissions (Important!)](#global-vs-resource-permissions-important)
  - [containsPermission v hasPermission](#containspermission-v-haspermission)
  - [Scopes or Multi-tenancy](#scopes-or-multi-tenancy)
    - [The Scope middleware](#the-scope-middleware) 
    - [Default Scope](#default-scope-tenant)
- [Cheat sheet](#cheat-sheet)
- [Todo](#todo)
- [Test](#test)
- [License](#license)
</p></details>

## Introduction

AdonisJs Acl is an elegant and powerful package for managing roles and permissions in any AdonisJs app. With an expressive and fluent syntax, it stays out of your way as much as possible: use it when you want, ignore it when you don't.

For a quick, glanceable list of Acl's features, check out the [cheat sheet](#cheat-sheet)

Once installed, you can simply tell the Acl what you want to allow:

```typescript
import {Acl} from '@holoyan/adonisjs-permissions'

// Give a user the permission to edit
await Acl.model(user).allow('edit');
// Behind the scenes Acl will create 'edit' permission and assign to the user if not available

// You can also grant a permission only to a specific model
const post = await Post.first()
await Acl.model(user).allow('delete', post);
// or 
await user.allow('delete', post)
```

To be able to use the full power of Acl, you should have a clear understanding of how it is structured and how it works. That's why the documentation will be divided into two parts: [Basic usage](#basic-usage) and [Advanced usage](#digging-deeper). For most applications, Basic Usage will be enough.

## Installation
    
    npm i @holoyan/adonisjs-permissions


Next publish config files

    node ace configure @holoyan/adonisjs-permissions
this will create `permissions.ts` file in `configs` directory, migration file in the `database/migrations` directory

Next run migration
    
    node ace migration:run


## Configuration

All models that will interact with `Acl` MUST use the `@MorphMap('ALIAS_FOR_CLASS')` decorator and implement the `AclModelInterface` contract.

Example. 

```typescript

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { MorphMap } from '@holoyan/adonisjs-permissions'
import { AclModelInterface } from '@holoyan/adonisjs-permissions/types'

@MorphMap('users')
export default class User extends BaseModel implements AclModelInterface {
  getModelId(): number {
    return this.id
  }
  
  // other code goes here
}

@MorphMap('admins')
export default class Admin extends BaseModel implements AclModelInterface {
  getModelId(): number {
    return this.id
  }
  // other code goes here
}

@MorphMap('posts')
export default class Post extends BaseModel implements AclModelInterface {
  getModelId(): number { // use `string` return type if your model has uuid/string primary keys 
    return this.id
  }

  // other code goes here
}

```

## Release Notes

Version: >= 'v0.7.14'
* Add UUID/string Support for scopes
* Fix permission,role create error for non UUID models

## Mixins

If you want to be able to call `Acl` methods on a `User` model then consider using `hasPermissions` mixin

```typescript

import { BaseModel, column } from '@adonisjs/lucid/orm'
import { MorphMap } from '@holoyan/adonisjs-permissions'
import { AclModelInterface } from '@holoyan/adonisjs-permissions/types'

// import mixin
import { hasPermissions } from '@holoyan/adonisjs-permissions'
import { compose } from '@adonisjs/core/helpers'

@MorphMap('users')
export default class User extends compose(BaseModel, hasPermissions()) implements AclModelInterface {
  getModelId(): number {
    return this.id
  }
  // other code goes here
}

// then all methods are available on the user

const user = await User.first()
const roles = await user.roles() // get user roles
await user.allow('edit') // give edit permission
// and so on...

```

## Support

### Database Support

Currently supported databases: `postgres`, `mysql`, `mssql`

### UUID support
from `v0.7.11` UUID support available, all you need to do change `uuidSupport` value to `true` in `config/permissions.ts` file, then run the migration and don't forget to change return type for the `getModelId()` method 

check [todo](#todo) list for more details

## Basic Usage

On this section, we will explore basic role permission methods.

### Creating roles and permissions

Let's manually create `create,update,read,delete` permissions, as well as `admin,manager` roles

> Look also [Creating permissions on a fly](#creating-permissions-on-a-fly) section

```typescript

import { Permission } from '@holoyan/adonisjs-permissions'
import { Role } from '@holoyan/adonisjs-permissions'
import {Acl} from "@holoyan/adonisjs-permissions";


// create permissions
const create = await Permission.create({
  slug:'create',
  title:'Create some resource', // optional
})

const update = await Permission.create({
  slug:'update',
})

// or create using Acl (recomended way)
const read = await Acl.permission().create({
  slug: 'read',
})


const delete = await Acl.permission().create({
  slug: 'delete',
})

// create roles
const admin = await Role.create({
  slug:'admin',
  title:'Cool title for Admin', // optional
})

// or create using Acl (recomended way)
const manager = await Acl.role().create({
  slug: 'manager',
})

```


The next step is to [assign permissions to the roles](#assigning-permissions-to-the-roles-globally)

### Assigning permissions to the roles (Globally)

Now that we have created roles and permissions, let's assign them.

```typescript
import {Acl} from "@holoyan/adonisjs-permissions";


await Acl.role(admin).assign('create')
// alternatively you can use allow(), give() method, as they are identical

await Acl.role(admin).allow('update')
await Acl.role(admin).giveAll(['read', 'delete'])
// alternatively you use giveAll(), assigneAll(), allowAll() for bulk assign

```

### Creating permissions on a fly

In case you are assigning a permission that is not already available, `Acl` will create new permission behind the scenes and assign them.

```typescript

// uploadFile permission not available
await Acl.role(admin).allow('uploadFile')
// 'uploadFile' permission created and assigned

```


### Assigning permissions and roles to the users (models)

Let's see in examples how to assign [roles and permissions](#creating-roles-and-permissions) to the users

```typescript
import {Acl} from "@holoyan/adonisjs-permissions";
import User from "#models/user";

const user1 = await User.query().where(condition1).first()
// give manager role to the user1
await Acl.model(user1).assignRole('manager')
// or just use assign() method, they are alias
// await Acl.model(user1).assign('manager')

const user2 = await User.query().where(condition2).first()
await Acl.model(user2).assign(admin)

```
Or we can give permissions directly to users without having any role

```typescript

import {Acl} from "@holoyan/adonisjs-permissions";

// create and assign a new permission
Acl.model(user1).assignDirectPermission('upload-file-slug')
// or use allow() method
Acl.model(user1).allow('permissionSlug')
```

### Multi-model support

We are not limited to using only the User model. If you have a multi-auth system like User and Admin, you are free to use both of them with Acl.


```typescript
await Acl.model(user).assignRole('manager')

await Acl.model(admin).assignRole('admin')

```

## Getting roles and permissions

In this section we will see how to get roles and permissions for a model and vice versa 

### Getting all roles for a user

```typescript

const roles = await Acl.model(user).roles()
```

### Getting all permissions for a role

```typescript

const roles = await Acl.role(role).permissions()
```

### Getting all permissions for a user (model)

```typescript

const roles = await Acl.model(user).permissions()
```

### Getting models from the permission

```typescript

const models = await Acl.permission(permission).models()

```
this will return array of `ModelPermission` which will contain `modelType,modelId` attributes, where `modelType` is *alias* which you had specified in [morphMap decorator](#configuration), `modelId` is the value of column, you've specified inside [getModelId](#configuration) method.

Most of the time, you will have only one model (User). It's better to use the `modelsFor()` method to get concrete models.

```typescript

const models = await Acl.permission(permission).modelsFor(User)

```
this will return [array of User models](https://lucid.adonisjs.com/docs/crud-operations#using-the-query-builder)

### Getting models for a role

```typescript

const models = await Acl.role(permission).models()

```

Or if you want to get for a specific model

```typescript

const models = await Acl.role(permission).modelsFor(User)

```

### Checking for a role

To check if user has role

```typescript

await Acl.model(user).hasRole('admin') // :boolean

```

you can pass list of roles 

```typescript

// returns true only if user has all roles
await Acl.model(user).hasAllRoles('admin', 'manager') 

```

To check if a user has any of the roles

```typescript

await Acl.model(user).hasAnyRole('admin', 'manager') 
// it will return true if the user has at least one role.

```

### Checking for a permission

Check if user has permission

```typescript

await Acl.model(user).hasPermission('update')
// or 
await Acl.model(user).can('update') // alias for hasPermission() method

// or simply call
await user.hasPermission('update')
```

To check array of permissions

```typescript

// returns true only if user has all permissions
await Acl.model(user).hasAllPermissions(['update', 'delete'])
// or 
await Acl.model(user).canAll(['update', 'delete']) // alias for hasAllPermissions() method

// await user.canAll(['update', 'delete'])

```

to check if user has any of the permission

```typescript

// returns true only if user has all permissions
await Acl.model(user).hasAnyPermission(['update', 'delete'])
// or 
await Acl.model(user).canAny(['update', 'delete']) // alias for hasAnyPermission() method

// will return true if user has at least one permission

```

Same applies for the roles

```typescript

await Acl.role(role).hasPermission('update')
await Acl.role(role).hasAllPermissions(['update', 'read'])
await Acl.role(role).hasAnyPermission(['update', 'read'])

```

### Middleware

You are free to do your check anywhere, for example we can create [named](https://docs.adonisjs.com/guides/middleware#named-middleware-collection) middleware and do checking

> don't forget to register your middleware inside kernel.ts


```typescript

// routes.ts
import { middleware } from '#start/kernel'

// routes.ts
router.get('/posts/:id', [ProductsController, 'show']).use(middleware.acl({permission: 'edit'}))


// acl_middleware.ts
export default class AclMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { permission: string }) {

    const hasPermission = await ctx.auth.user.hasPermission(options.permission)
    
    if(!hasPermission) {
      ctx.response.abort({ message: 'Cannot edit post' }, 403)
    }

    const output = await next()
    return output
  }
}

```

### Removing (revoking/detach) roles and permissions from the model

To revoke(detach) role from the user we can use `revoke` method

```typescript

await Acl.model(user).revokeRole('admin')
await Acl.model(user).revokeAllRoles(['admin', 'manager'])

// will remove all assigned roles
await Acl.model(user).flushRoles()

```

Revoking permissions from the user

```typescript
await Acl.model(user).revokePermission('update')
await Acl.model(user).revoke('delete') // alias for revokePermission()

// await Acl.model(user).hasPermission('update') will return false

await Acl.model(user).revokeAllPermissions(['update', 'delete'])
await Acl.model(user).revokeAll(['update', 'delete']) // alias for revokeAllPermissions()

// revoke all assigned permissions
await Acl.model(user).flushPermissions()

// revokes all roles and permissions for a user
await Acl.model(user).flush()

```

Removing permissions from the role

```typescript
await Acl.role(role).revokePermission('update')
// or 
await Acl.role(role).revoke('update') // alias for revokePermission

await Acl.role(role).revokeAllPermissions(['update', 'delete'])
// alias revokeAll(['update', 'delete'])

// remove all assigned permissions
await Acl.role(role).flushPermissions()
// alias flush()

```


### Deleting roles and permissions (Important!)

> Recommended! use Acl to delete roles and permissions instead of directly making queries on the Role,Permission model, under the hood Acl does some checking

```typescript

await Acl.role().delete('admin')

await Acl.permission().delete('edit')

```

To see in dept usage of this methods check [next section](#digging-deeper)

## Digging deeper

In the [previous](#basic-usage) section, we looked at basic examples and usage. Most of the time, basic usage will probably be enough for your project. However, there is much more we can do with `Acl`.

### Restricting a permission on a resource

Sometimes you might want to restrict a permission on a specific model(resource). Simply pass the model as a second argument:

```typescript
import Product from "#models/product";

await Acl.model(user).allow('edit', Product)

```
>Important! - Don't forget to add `MorphMap` decorator and `AclModelInterface` on Product class

```typescript

@MorphMap('products')
export default class Product extends BaseModel implements AclModelInterface {
  getModelId(): number {
    return this.id
  }
  // other code
}

```

>Warning: All models which interact with Acl **MUST** use [MorphMap]() decorator and implement `AclModelInterface`

Then we can make checking again

```typescript
import Product from "#models/product";
import Post from "#models/post";

// await Acl.model(user).allow('edit', Product)

const productModel1 = Product.find(id1)
const productModel50 = Product.find(id50)
const postModel = Post.find(postId)

await Acl.model(user).hasPermission('edit', productModel1) // true
await Acl.model(user).hasPermission('edit', productModel50) // true
// ... for all Product model instances it will return true
await Acl.model(user).hasPermission('edit', Product) // true

await Acl.model(user).hasPermission('edit', postModel) // false
await Acl.model(user).hasPermission('edit', Post) // false

await Acl.model(user).hasPermission('edit') // false

// containsPermission() method will tell if user has 'edit' permission attached at all
await Acl.model(user).containsPermission('edit') // true

```

Check [ContainsPermission vs hasPermission](#containspermission-v-haspermission) section for more details

We can restrict even more, and give permission to the specific model

```typescript

import Product from "#models/product";

const product1 = Product.find(1)

await Acl.model(user).assignDirectPermission('edit', product1)

const product2 = Product.find(2)

await Acl.model(user).hasPermission('edit', product1) // true
await Acl.model(user).hasPermission('edit', product2) // false

await Acl.model(user).hasPermission('edit', Product) // false

await Acl.model(user).hasPermission('edit') // false
await Acl.model(user).containsPermission('edit') // true

```

This will behave the same way if you assign the permission through the role instead of directly

```typescript

const product1 = Product.find(1)

await Acl.role(admin).allow('edit', product1)

const user = await User.first()

// assign role
await Acl.model(user).assignRole(role)

// then if we start checking, result will be same

const product2 = Product.find(2)

await Acl.model(user).hasPermission('edit', product1) // true
await Acl.model(user).hasPermission('edit', product2) // false

await Acl.model(user).hasPermission('edit', Product) // false

await Acl.model(user).hasPermission('edit') // false
await Acl.model(user).containsPermission('edit') // true

```

### Forbidding permissions

Let's imagine a situation where `manager` role has `create,update,read,delete` permissions. 

All your users have `manager` role but there are small amount of users you want to forbid `delete` action. 
Good news!, we can do that

```typescript

await Acl.role(manager).giveAll(['create','update','read','delete'])

// assigning to the users
await Acl.model(user1).assign('manager')

await Acl.model(user3).assign('manager')
await Acl.model(user3).forbid('delete')

await Acl.model(user1).hasRole('manager') // true
await Acl.model(user1).can('delete') // true

await Acl.model(user3).hasRole('manager') // true
await Acl.model(user3).can('delete') // false

await Acl.model(user3).contains('delete') // true

```

### Forbidding permissions on a resource

You can also forbid single action on a resource

```typescript

const post = Post.find(id1)

await Acl.model(user3).forbid('delete', post)

```

### Checking for forbidden permissions

In [previous](#forbidding-permissions) section we saw how to forbid certain permissions for the model, even if user has that permission through the role, now we will look how to check if permission is forbidden or not

```typescript

await Acl.model(user3).assignRole('manager')
await Acl.model(user3).forbid('delete')

await Acl.model(user3).forbidden('delete') // true

const post1 = Post.find(id1)

await Acl.model(user).allow('edit', Post) // allow for all posts
await Acl.model(user).forbid('edit', post1) // except post1

await Acl.model(user).forbidden('edit', post1) // true

const post7 = Post.find(id7)
await Acl.model(user).forbidden('edit', post7) // false becouse 'edit' action forbidden only for the post1 instance
```

### Unforbidding the permissions

```typescript

await Acl.model(user3).assignRole('manager')
await Acl.model(user3).forbid('delete')

await Acl.model(user3).forbidden('delete') // true
await Acl.model(user3).can('delete') // false
await Acl.model(user3).can('delete') // true

await Acl.model(user3).unforbid('delete')
await Acl.model(user3).forbidden('delete') // false
await Acl.model(user3).can('delete') // true

```
Same behaviour applies with roles

```typescript
await Acl.role(role).assignRole('manager')
await Acl.role(role).forbid('delete')

await Acl.role(role).forbidden('delete') // true
await Acl.role(role).hasPermission('delete') // false
await Acl.role(role).contains('delete') // true

```

### Global vs resource permissions (Important!)

> Important! Actions performed globally will affect on a resource models

It is very important to understand difference between global and resource permissions and their scope.
Look at this way, if there is no `entity` model, then actions will be performed **globally**, otherwise **on resource**

```


|--------------Global--------------|
|                                  |
|    |------Class level------|     |
|    |                       |     |
|    |   |--Model level--|   |     |
|    |   |               |   |     |
|    |   |               |   |     |
|    |   |               |   |     |
|    |   |---------------|   |     |
|    |                       |     |
|    |-----------------------|     |
|                                  |
|----------------------------------|

```

```typescript
import {Acl} from "@holoyan/adonisjs-permissions";
import Post from "#models/post";

// first assigning permissions
// Global level
await Acl.model(admin).allow('create');
await Acl.model(admin).allow('edit');
await Acl.model(admin).allow('view');

// class level
await Acl.model(manager).allow('create', Post)

// model level
const myPost = await Post.find(id)
await Acl.model(client).allow('view', myPost)

// start checking
// admin
await Acl.model(admin).hasPermission('create') // true
await Acl.model(admin).hasPermission('create', Post) // true
await Acl.model(admin).hasPermission('create', myPost) // true

// manager - assigned class level
await Acl.model(manager).hasPermission('create') // false
await Acl.model(manager).hasPermission('create', Post) // true
await Acl.model(manager).hasPermission('create', myPost) // true
await Acl.model(manager).hasPermission('create', myOtherPost) // true

// assigned model level
await Acl.model(client).hasPermission('create') // false
await Acl.model(client).hasPermission('create', Post) // false
await Acl.model(client).hasPermission('create', myPost) // true
await Acl.model(client).hasPermission('create', myOtherPost) // false
// ... and so on

```

Same is true when using `forbidden` action

```typescript

// class level
await Acl.model(manager).allow('edit', Post) // allow to edit all posts

await Acl.model(manager).forbid('edit', myPost) // forbid editing ONLY on a myPost

await Acl.model(client).hasPermission('edit', Post) // true
await Acl.model(client).hasPermission('edit', myPost) // false
await Acl.model(client).hasPermission('edit', myOtherPost) // true

```

### containsPermission v hasPermission

As you've already seen there are difference between `containsPermission` and `hasPermission` methods. `containsPermission()` method will return `true` if user has that permission, it doesn't matter if it's *global*, *on resource* or *forbidden*.

> `contains()` method is alias for `containsPermission()`

Lets in example see this difference

```typescript


await Acl.model(user).allow('edit'); // assing globally
await Acl.model(user).containsPermission('edit') // true


await Acl.model(user).allow('delete', Post); // assing on resource
await Acl.model(user).containsPermission('delete') // true


await Acl.model(user).forbid('read'); // forbid read action
await Acl.model(user).containsPermission('read') // true

```

## Scopes or Multi-tenancy

Acl fully supports multi-tenant apps, allowing you to seamlessly integrate  roles and permissions for all tenants within the same app.

```typescript

// lets say all users have organization_id attribute

await Acl.model(user).on(user.project_id).allow('edit')
await Acl.model(user).on(user.project_id).allow('delete')

// checking
await Acl.model(user).on(user.project_id).hasPermission('edit') // true
await Acl.model(user).on(user.project_id).hasPermission('delete') // true

// checking without scope
await Acl.model(user).hasPermission('edit') // false - by default scope is equal to 'default'


```

### The Scope middleware

`Acl` has built-in middleware to make scope checking easier.


This middleware is where you tell `Acl` which tenant to use for the current request. For example, assuming your users all have an account_id attribute, this is what your middleware would look like:

```typescript

// acl_middleware
export default class AclScopeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const scope = new Scope()
    scope.set(auth.user.account_id)
    ctx.acl = new AclManager().scope(scope)
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

// then on controller you can do

// post_controller.ts

export default class PostController {
  async show({acl}: HttpContext){
    // will check inside auth.user.account_id scope
    await acl.model().hasPermission('view')
    // this both will be equal
    // await acl.model().on(auth.user.account_id).hasPermission('view')
  }
}

```
> Important! If you are using `AclScopeMiddleware` and want to have scope functional per-request then use `acl` from the `ctx` instead of using global `Acl` (NOTE: lower case) object, otherwise changes inside `AclScopeMiddleware` will not make effect

Let's see in example


```typescript

// acl_middleware
export default class AclScopeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const scope = new Scope()
    scope.set('dashboard') // set scope value to 'dashboard' for current request
    ctx.acl = new AclManager().scope(scope)
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

// post_controller.ts
// global object
import {Acl} from "@holoyan/adonisjs-permissions";

export default class PostController {
  async show({acl}: HttpContext){
    const scope = acl.getScope() 
    console.log(scope.get()) // 'dashboard'
    // global object
    console.log(Acl.getScope()) // 'default'
    
    acl.scope('dashboard_1')// update and set new scope
    // for current request it will be 'dashboard_1'
    console.log(acl.getScope()) // 'dashboard_1'

    Acl.scope('dashboard_2') // Throws error
    // check next for the details
    await Acl.model(user).on(8).permissions() // get permissions for user on scope 8    
  }
}

```

> Important! By default, you can't update scope on global object, it will throw an error, because by updating global `Acl` scope it will rewrite for an entire application and this will lead to unexpected behavior BUT if you still want to do that then you can do it by passing `forceUpdate` param

```typescript

// global object
import {Acl} from "@holoyan/adonisjs-permissions";


Acl.scope('dashboard_2') // Throws error

// you can force update
let forceUpdate = true;
Acl.scope('dashboard_2', forceUpdate) 

// concurent requests will override each other

// request 1 
Acl.scope('scope_1', forceUpdate)
// other code - long process

// request 2 - simultaneously
Acl.scope('scope_2', forceUpdate) // will override request 1 scope 

```


### Default scope (Tenant)

> Default Scope value is equal to 'default'


## Cheat sheet

Coming soon


## TODO

- [X] Scopes (Multitenancy)
- [X] UUID support
- [ ] Events
- [ ] More test coverage
- [ ] Caching
- [ ] Integration with AdonisJs Bouncer

## Test

    npm run test


## License


MIT
