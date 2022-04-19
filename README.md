# Commonsense Platform

## Getting Started For New Contributors

### Your development environment
#### Your OS
To start, we highly reccomend to use unix based os (windows subsystem linux (wsl) -- ubuntu distro, linux, or macos). If you are in 
windows here are instructions to install https://docs.microsoft.com/en-us/windows/wsl/install

If you are on mac, it is likely that you will need brew as your package manager. (no sudo apt install for you :()
#### Git
Install git. https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

Please set the following option in command line `git config --global core.autocrlf true`.
This makes sure line endings are normalized across operating systems.

#### NodeJs
After you are in the right os, please install node through nvm (package manager for different versions of node)
https://github.com/nvm-sh/nvm

#### MySql
Follow these instructions to install mysql, 
1. ubuntu/wsl -- https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04 (only follow up to step 1-- the installation and starting)
2. macos -- https://flaviocopes.com/mysql-how-to-install/ (don't install tables plus at the end)

We are only setting up local sql instance, so many security configurations are highly unnecesary as your mysql is only accesible by you

_Anything in angle brackets should be replaced_
```mysql
sudo mysql
CREATE DATABASE testdb;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON testdb.* to 'admin'@'localhost'
```
To interact with mysql through gui, I like DbBeaver
https://dbeaver.io/

### Your .env file
There is issue to setup more authentication providers on the watts-lab gmail account. Never commit .env files
```
DATABASE_URL=mysql://admin:<password>@localhost:3306/testdb
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=somethingrandom
GOOGLE_ID=<>
GOOGLE_SECRET=<>
```

### Finally...
```bash
npm i 
sudo service mysql start // start your sql server if it isn't already (wrote ubuntu instructions, find mac version)
npx prisma migrate dev // this will put the tables into your local db
npm run dev // any changes in your file will auto reload the server
```
Open [http://localhost:3000](http://localhost:3000) with your browser. Yay!

Moreover, to browse data while you are devloping use
```
npx prisma studio
```

## Getting your feet wet
### Nextjs Basics

Nextjs has 3 key folders `/pages`, `/components`, and `/pages/api`. 

1. `/pages`: In NextJs, each page file is route. For example, the file `/pages/encode.tsx` will actually be `www.example.com/encode` on your website. This makes routing extremely simple and useful. Moreover, folders will append prefixes to all the files in the folder. For example, `/pages/api/statement.tsx` will show up as `www.example.com/api/statement`. Unless otherwised configured, this code will be on client side (NO SENSITIVE INFO here) Your website mirrors your file directory!
2. `/components`: This is where you write your reusuable react components that might be used every where in your code base
3. `/pages/api` is a special folder, where are server side api routes can be written. You can write code that handles sensitive information and it will not be shown to the client

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### Prisma Basics
Prism is Object Relational Mapper (ORM).

Key to prisma is schema.prisma within the prisma folder. This contains all the tables within our database and their relation.

Before diving into prisma, it is key to have some fundamental knowledge of relational tables
Digital ocean has extremely great guide.
https://www.digitalocean.com/community/tutorials/understanding-relational-databases

After that, you can understand how to update and make changes to the prisma schema with this website
https://www.prisma.io/docs/concepts/components/prisma-schema

Propogating changes in your local development. This also keeps a history of changes exactly like git
`npx prisma migrate dev`

### Devops (CI, deployment, etc..)
Only infastructure people really need this. Feel free to skip if not relevant.
#### Docker
will be written soon

#### AWS 
will be written soon

