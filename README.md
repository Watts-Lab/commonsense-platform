# Commonsense Platform

## Getting Started For New Contributors

### Your development environment
#### Your OS
To start, we highly reccomend to use unix based os (windows subsystem linux-- ubuntu distro, linux, or macos). If you are in 
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
ubuntu -- https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04 (only follow up to step 1-- the installation and starting)
macos -- https://flaviocopes.com/mysql-how-to-install/ (don't install tables plus at the end)

We are only setting up local sql instance, so many security configurations are highly unnecesary as your mysql is only accesible by you

**Anything in angle brackets should be replaced**
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

### Almost there....
```bash
npm i && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Nextjs Basic Documentation
### Getting Started




You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
