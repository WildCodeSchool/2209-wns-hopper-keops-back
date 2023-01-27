import { DataSource } from "typeorm";
import { Challenge } from "./entity/Challenge";
import { User } from "./entity/User";
import { UserToChallenge } from "./entity/UserToChallenge";

// Identifiant de connexion à la base de donnée et choix des tables à récupérer
const dataSource = new DataSource({
  type: "postgres",
  // l'adresse est celle de l'image de la base de donnée cette adresse est routé par docker
  host: process.env.DB_HOST,
  port: 5432,
  username: "postgres",
  password: "secret",
  database: "postgres",
  // permet de construire le chemin et les tables si elle ne sont pas créée
  synchronize: true,
  // option d'affichage des erreur et requête SQL dans la console
  logging: ["query", "error"],
  entities: [User, Challenge, UserToChallenge],
});

export default dataSource;
