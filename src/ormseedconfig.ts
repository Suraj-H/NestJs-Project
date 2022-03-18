import ormconfig from './ormconfig';

const ormseedconfig = {
  ...ormconfig,
  migrations: [__dirname + 'src/seeds/*.ts'],
  cli: {
    migrationsDir: 'src/seeds'
  }
}

export default ormseedconfig;