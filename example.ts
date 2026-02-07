/**
 * Exemple d'utilisation de FemtoLogger
 *
 * Pour tester :
 * 1. Créer un fichier .env avec TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID
 * 2. npm run dev (pour compiler en watch mode)
 * 3. node dist/example.js
 */

import { FemtoLogger, TelegramTransport } from './src/index';

async function main() {
  // Vérifier les variables d'environnement
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('❌ Variables d\'environnement manquantes');
    console.log('Veuillez définir TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID');
    process.exit(1);
  }

  // Créer le logger
  const logger = new FemtoLogger({
    transports: [
      new TelegramTransport({
        token,
        chatId,
        parseMode: 'HTML',
      }),
    ],
    level: 'info', // Niveau minimum : info, warn, error
  });

  console.log('📤 Envoi de logs de test vers Telegram...\n');

  // Exemples d'utilisation
  await logger.info('🚀 FemtoLogger - Test démarré', {
    version: '0.1.0',
    environment: 'development',
  });

  await logger.warn('⚠️ Ceci est un avertissement', {
    memory: '85%',
    cpu: '60%',
  });

  await logger.error('❌ Exemple d\'erreur', {
    code: 'ERR_CONNECTION_REFUSED',
    host: 'db.example.com',
    port: 5432,
  });

  console.log('✅ Logs envoyés ! Vérifiez votre Telegram.');
}

// Exécution
main().catch((err) => {
  console.error('Erreur lors de l\'exécution:', err);
  process.exit(1);
});
