import time
import schedule
import logging
import sys
from core.bridge import IrisBridge
from core.broadcaster import Broadcaster

# Configuração de Logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [MERCURIO] - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("mercurio")
bridge = IrisBridge()
broadcaster = Broadcaster()

def job():
    logger.info("Iniciando ciclo de comunicação...")
    data = bridge.get_trends()
    if data:
        broadcaster.distribute(data)
    else:
        logger.warning("Sem dados do Iris para processar.")

if __name__ == "__main__":
    logger.info("Mercurio está online e aguardando...")
    
    # Executa imediatamente ao iniciar
    job()
    
    # Agenda para rodar a cada 60 segundos
    schedule.every(60).seconds.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)