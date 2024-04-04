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
  - [Assigning permissions and roles to the users (models)](#assigning-permissions-and-roles-to-the-users-models)
  - [Multi-model support](#multi-model-support)
  - [Getting all roles for a user](#getting-all-roles-for-a-user)
  - [Getting all permissions for a role](#getting-all-permissions-for-a-role)
  - [Getting all permissions for a user (model)](#getting-all-permissions-for-a-user-model)
  - [Getting users (models) for a permission](#getting-users-models-for-a-permission)
  - [Getting models for a role](#getting-models-for-a-role)
  - [Checking for a permission](#checking-for-a-permission)
  - [Removing (revoking) roles and permissions from the model](#removing-revoking-roles-and-permissions-from-the-model)
- [Digging deeper](#digging-deeper)
  - [Restricting a permission to a model (On resource)](#restricting-a-permission-to-a-model-on-resource)
  - [Forbidding permissions](#forbidding-permissions)
  - [Forbidding permissions on a resource](#forbidding-permissions-on-a-resource)
  - [Checking for forbidden permissions](#checking-for-forbidden-permissions)
  - [Unforbidding the permissions](#unforbidding-the-permissions)
  - [Global vs resource permissions (Important!)](#global-vs-resource-permissions-important)
  - [containsPermission v hasPermission](#containspermission-v-haspermission)
- [Test](#test)
- [License](#license)
</p></details>

## Introduction

AdonisJs acl is an elegant and powerful package to managing roles and permissions for any AdonisJs app. With an expressive and fluent syntax, it stays out of your way as much as possible: use it when you want, ignore it when you don't.

For a quick, glanceable list of acl's features, check out [the cheat sheet](#cheat-sheet).

Once installed, you can simply tell the Acl what you want to allow:

```typescript
import {Acl} from '@holoyan/adonisjs-permissions'


// Give a user the permission to edit
await Acl.model(user).allow('edit');

// Alternatively, do it through a permission
await Acl.permission('edit').attachToModel(user);

// You can also grant a permission only to a specific model
const post = await Post.first()
await Acl.model(user).allow('delete', post);
// or 
await user.allow('delete', post)
```

To be able to use full power of Acl you should have clear understanding how it is structured and works, that's why documentation will be divided into two parts - [Basic usage](#basic-usage) and [Advanced usage](#digging-deeper) .
For most of the applications [Basic usage](#basic-usage) will be enough

## Installation
    
    npm i @holoyan/adonisjs-permissions


Next publish config files

    node ace configure @holoyan/adonisjs-permissions
this will create permissions.ts file in `configs` and migration file in the `database/migrations` directory

Next run migration
    
    node ace migration:run


## Configuration

All models which will interact with `Acl` MUST use `@MorphMap('ALIAS_FOR_CLASS')` decorator and implement `AclModelInterface` contract

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
  getModelId(): number {
    return this.id
  }

  // other code goes here
}

```


## Mixins

If you want to be able to call these methods on a `User` model then consider using `hasPermissions` mixin

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
const roles = await user.roles() // and so on


```

## Support

### Database Support

Currently supported databases: `postgres`, `mysql`, `mssql`

### UUID support
No uuid support *yet*

## Basic Usage

On this section we will explore basic role permission methods

### Creating roles and permissions

Let's create `create,update,read,delete` permissions and `admin,manager` roles

```typescript

// create permissions
const create = await Acl.permission().create({
  slug:'create',
  title:'Create some resource',
})

const update = await Acl.permission().create({
  slug:'update',
  title:'update some resource',
})

const read = await Acl.permission().create({
  slug:'read',
  title:'read some resource',
})

const delete = await Acl.permission().create({
  slug:'delete',
  title:'delete some resource',
})

// create roles
const admin = await Acl.role().create({
  slug:'admin',
  title:'Cool title for Admin',
})

const manager = await Acl.role().create({
  slug:'manager',
  title:'Cool title for Manager',
})

```

next step is to [assign permissions to the roles](#assigning-permissions-to-the-roles-globally)

### Assigning permissions to the roles (Globally)

Now once we've created roles and permissions let's assign them

```typescript
await Acl.role(admin).assign('create')
// or you can use give() method, they are identical
await Acl.role(admin).give('update')
// or you use giveAll(), assigneAll() for bulk assign
await Acl.role(admin).giveAll(['read', 'delete'])
```

### Assigning permissions and roles to the users (models)

Let's see in examples how to assign [roles and permissions](#creating-roles-and-permissions) to the users

```typescript
import {Acl} from "@holoyan/adonisjs-permissions";
import User from "#models/user";

const user1 = await User.query().where(condition1).first()
// give manager role to the user1
await Acl.model(user1).assignRole(manager)

const user2 = await User.query().where(condition2).first()
await Acl.model(user2).assignRole(admin)

```
Or we can give permissions directly to users without having any role

```typescript

import {Acl} from "@holoyan/adonisjs-permissions";

// create new permission
const uploadFile = await Acl.permission().create({
  slug: 'upload-file-slug',
  title: 'permisison to upload files',
})

Acl.model(user1).assignDirectPermission('upload-file-slug')

```

### Multi-model support

We are not limiting to use only User model, if you have multi auth system like User and Admin you are free to use both of them with Acl.


```typescript
await Acl.model(user).assignRole(manager)

await Acl.model(admin).assignRole(admin)

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

### Getting users (models) for a permission

```typescript

const models = await Acl.permission(permission).models()

```
this will return array of `ModelPermission` which will contain `modelType,modelId` attributes, where `modelType` is *alias* which you had specified in [morphMap decorator](#configuration), `modelId` is the value of column, you've specified in [getModelId](#configuration) method.

Most of the cases you will have only one model (User), it's better to use `modelsFor()` to get  concrete models

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

const models = await Acl.role(permission).modelsFor(Admin)

```

### Checking for a role

To check if user has role

```typescript

await Acl.model(user).hasRole('admin') // :boolean

```

you can pass array of roles 

```typescript

// returns true only if user has all roles
await Acl.model(user).hasAllRoles('admin', 'manager') 

```

to check if user has any of roles, will return true if user has at least one role 

```typescript

await Acl.model(user).hasAnyRole('admin', 'manager') 

```

### Checking for a permission

Check if user has permission

```typescript

await Acl.model(user).hasPermission('update')
// or 
await Acl.model(user).can('update') // alias for hasPermission() method

```

To check array of permissions

```typescript

// returns true only if user has all permissions
await Acl.model(user).hasAllPermissions(['update', 'delete'])
// or 
await Acl.model(user).canAll(['update', 'delete']) // alias for hasAllPermissions() method

```

to check if user has any of permission, will return true if user has at least one permission

```typescript

// returns true only if user has all permissions
await Acl.model(user).hasAnyPermission(['update', 'delete'])
// or 
await Acl.model(user).canAny(['update', 'delete']) // alias for hasAnyPermission() method

```

Same applies for role

```typescript

await Acl.role(role).hasPermission('update')
await Acl.role(role).hasAllPermissions(['update', 'read'])
await Acl.role(role).hasAnyPermission(['update', 'read'])

```

### Removing (revoking) roles and permissions from the model

To remove role from the user we can use `revoke` method

```typescript

await Acl.model(user).revokeRole('admin')
await Acl.model(user).revokeAllRoles(['admin', 'manager'])

// will remove all assigned roles
await Acl.model(user).flushRoles()

```

Removing permissions from the user

```typescript
await Acl.model(user).revokePermission('update')
// await Acl.model(user).hasPermission('update') will return false

await Acl.model(user).revokeAllPermissions(['update', 'delete'])

// will remove all assigned permissions
await Acl.model(user).flushPermissions()

// revokes all roles and permissions for a user
await Acl.model(user).flush()

```

Removing permissions from the role

```typescript
await Acl.role(role).revokePermission('update')
// or 
await Acl.role(role).revoke('update') // alias for revokePermission - WORKS ONLY on roles

await Acl.role(role).revokeAllPermissions(['update', 'delete'])
// alias revokeAll(['update', 'delete']) method availalbe ONLY on roles

// remove all assigned permissions
await Acl.role(role).flushPermissions()
// alias flush() method availalbe ONLY on roles

```


### Deleting roles and permissions (Important!)

> Important! use Acl to delete roles and permissions, under the hood Acl does some checking

```typescript

await Acl.role().delete('admin')

await Acl.permission().delete('edit')

```

To see in dept usage of this methods check [next section](#digging-deeper)

## Digging deeper

In [previous](#basic-usage) section we looked basic examples and usage, most of the time basic usage probably will be enough for your project but there are much more we can do with `Acl`

### Restricting a permission to a model (On resource)

Sometimes you might want to restrict a permission to a specific model type. Simply pass the model name as a second argument:

```typescript
import Product from "#models/product";

await Acl.model(user).assignDirectPermission('edit', Product)

```
>Just don't forget to add model `MorphMap` decorator on Product class

```typescript

@MorphMap('products')
export default class Product extends BaseModel {
  // other code
}

```

>Warning: All models which interact with Acl **MUST** use [MorphMap]() decorator

In this case we check permission again

```typescript
import Product from "#models/product";
import Post from "#models/post";

const productModel1 = Product.first()
const productModel50 = Product.first()
const postModel = Post.first()

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

This will behave same way if assign permission through the role instead of direct

```typescript

const product1 = Product.find(1)

await Acl.role(admin).assign('edit', product1)

const user = await User.first()

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

Let's imagine a situation when your `manager` role has `create,update,read,delete` permissions. All your users have `manager` role but there are small amount of users you want to give `manager` role but same time do not allow `delete` action. 
Good news!, we can do that

```typescript

await Acl.role(manager).giveAll(['create','update','read','delete'])

// assigning to the users
await Acl.model(user1).assignRole(manager)

await Acl.model(user3).assignRole(manager)
await Acl.model(user3).forbid('delete')

await Acl.model(user1).hasRole(manager) // true
await Acl.model(user1).hasPermission('delete') // true

await Acl.model(user3).hasRole(manager) // true
await Acl.model(user3).hasPermission('delete') // false

await Acl.model(user3).containsPermission('delete') // true

```

### Forbidding permissions on a resource

You can also forbid single action on a resource

```typescript

const post = Post.find(id1ToFind)

await Acl.model(user3).forbid('delete', post)

```

### Checking for forbidden permissions

In [previous](#forbidding-permissions) section we saw how to forbid certain permissions for the model, even if user has that permission through the role, now we will look how to check if permission is forbidden or not

```typescript

await Acl.model(user3).assignRole(manager)
await Acl.model(user3).forbid('delete')

await Acl.model(user3).forbidden('delete') // true


const post1 = Post.find(id1ToFind)


await Acl.model(user).allow('edit', Post) // allow for all posts
await Acl.model(user).forbid('edit', post1) // except post1

await Acl.model(user).forbidden('edit', post1) // true

const post7 = Post.find(id7ToFind)
await Acl.model(user).forbidden('edit', post7) // false becouse 'edit' action forbidden only for post1 instance
```

### Unforbidding the permissions

```typescript

await Acl.model(user3).assignRole(manager)
await Acl.model(user3).forbid('delete')

await Acl.model(user3).forbidden('delete') // true
await Acl.model(user3).hasPermission('delete') // false
await Acl.model(user3).containsPermission('delete') // true

await Acl.model(user3).unforbid('delete')
await Acl.model(user3).forbidden('delete') // false
await Acl.model(user3).hasPermission('delete') // true

```
Same behaviour applies with roles

```typescript
await Acl.role(role).assignRole(manager)
await Acl.role(role).forbid('delete')

await Acl.role(role).forbidden('delete') // true
await Acl.role(role).hasPermission('delete') // false
await Acl.role(role).containsPermission('delete') // true

```

### Global vs resource permissions (Important!)

> Important! Action performed globally will affect on a resource models

It is very important to understood difference between global and resource permissions and their scope.
Look at this way, if there is no `entity` model then action will be performed **globally**, otherwise **on resource**

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


// Global level
await Acl.model(admin).allow('create');
await Acl.model(admin).allow('edit');
await Acl.model(admin).allow('view');

// class level
await Acl.model(manager).allow('create', Post)

// model level
const myPost = await Post.find(id)
await Acl.model(client).allow('view', myPost)

// checking
// admin
await Acl.model(admin).hasPermission('create') // true
await Acl.model(admin).hasPermission('create', Post) // true
await Acl.model(admin).hasPermission('create', myPost) // true

// manager
await Acl.model(manager).hasPermission('create') // false
await Acl.model(manager).hasPermission('create', Post) // true
await Acl.model(manager).hasPermission('create', myPost) // true
await Acl.model(manager).hasPermission('create', myOtherPost) // true

// client
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

await Acl.model(manager).forbid('edit', myPost) // forbid editing on a specific post


await Acl.model(client).hasPermission('edit', Post) // true
await Acl.model(client).hasPermission('edit', myPost) // false
await Acl.model(client).hasPermission('edit', myOtherPost) // true

```

### containsPermission v hasPermission

As you've already seen there are difference between `containsPermission` and `hasPermission`. `containsPermission()` method will return `true` if user has that permission, it doesn't matter if it's *global*, *on resource* or *forbidden*

Lets in example see this difference

```typescript


await Acl.model(user).allow('edit'); // assing globally
await Acl.model(user).containsPermission('edit') // true


await Acl.model(user).allow('delete', Post); // assing on resource
await Acl.model(user).containsPermission('delete') // true


await Acl.model(user).forbid('read'); // forbid read action
await Acl.model(user).containsPermission('read') // true

```

## Test

    npm run test


## License


MIT
