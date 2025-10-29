import scrapy
from scrapy_selenium import SeleniumRequest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


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
        driver = response.request.meta["driver"]  # Récupère le driver Selenium
    
        # attendre que le tableau se charge
        WebDriverWait(driver, 15).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "table tbody tr"))
        )
        
        # maintenant, on récupère le HTML complet après chargement
        html = driver.page_source
        response = scrapy.Selector(text=html)
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "table tbody tr"))
        )

        # parser comme avant
        rows = response.css("table tbody tr")
        for row in rows:
            yield {
                "symbol": row.css("td[data-testid-cell=ticker] span.symbol::text").get(),
                "name": row.css("div.companyName::text").get(),
                "price": row.css("fin-streamer[data-field=regularMarketPrice]::text").get(),
                "change": row.css("fin-streamer[data-field=regularMarketChange] span::text").get(),
                "change_percent": row.css("fin-streamer[data-field=regularMarketChangePercent] span::text").get(),
                "volume": (
                                row.css("fin-streamer[data-field=regularMarketVolume] span::text").get()
                                or row.css("fin-streamer[data-field=regularMarketVolume]::attr(data-value)").get()
                            ),

            }

