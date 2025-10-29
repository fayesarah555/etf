import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import scrapy
from scrapy_selenium import SeleniumRequest

class EtfSpider(scrapy.Spider):
    name = "etf"

    def start_requests(self):
        yield SeleniumRequest(
            url="https://finance.yahoo.com/etfs",
            wait_time=10,
            wait_until=EC.element_to_be_clickable((By.NAME, "agree")),
            callback=self.parse,
            script="document.querySelector('button[name=agree]').click();"
        )

    def parse(self, response):
        driver = response.meta["driver"]
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)

        # Attendre que le tableau soit bien chargé
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
        )

        try:
            # Étape 1 : cliquer sur le bouton "Rows per page"
            rows_button = WebDriverWait(driver, 30).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class,'menuBtn')]"))
            )
            driver.execute_script("arguments[0].click();", rows_button)

            # Étape 2 : cliquer sur l’option "100" dans le menu déroulant
            option_100 = WebDriverWait(driver, 30).until(
                EC.element_to_be_clickable((By.XPATH, "//div[@role='option' and @data-value='100']"))
            )
            driver.execute_script("arguments[0].click();", option_100)

            # Étape 3 : attendre que >50 lignes soient chargées
            WebDriverWait(driver, 20).until(
                lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) > 50
            )
            self.logger.info("✅ Changement réussi : affichage sur 100 lignes")

        except Exception as e:
            self.logger.warning(f"⚠️ Impossible de changer en 100 lignes : {e}")

        # Extraire toutes les lignes
        rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
        for row in rows:
            yield {
                "symbol": row.find_element(By.CSS_SELECTOR, "td:nth-child(1) span.symbol").text,
                "name": row.find_element(By.CSS_SELECTOR, "td:nth-child(2) div.companyName").text,
                "price": row.find_element(By.CSS_SELECTOR, "fin-streamer[data-field='regularMarketPrice']").text,
                "change": row.find_element(By.CSS_SELECTOR, "fin-streamer[data-field='regularMarketChange']").text,
                "change_percent": row.find_element(By.CSS_SELECTOR, "fin-streamer[data-field='regularMarketChangePercent']").text,
                "volume": row.find_element(By.CSS_SELECTOR, "fin-streamer[data-field='regularMarketVolume']").text,
            }
