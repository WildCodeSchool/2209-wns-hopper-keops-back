import dataSource from "../src/utils";

export async function initializeTestDb(): Promise<void> {
  // Généreratin de l'api de test
  // Connection à la db
  await dataSource.initialize();

  // Pugre la db
  try {
    // Demande toute les entitées de la db
    const entities = dataSource.entityMetadatas;
    // Prépare une chaine de caractère contenant le nom de toutes les entités
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(", ");
    // Fait une requête SQL à la base de donnée pour supprimer tout les ligne de la db ainsi que les relations
    await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`);
    console.log("DATABASE: Clean");
  } catch (error: any) {
    throw new Error(`ERROR: Cleaning database: ${JSON.stringify(error)}`);
  }
}
