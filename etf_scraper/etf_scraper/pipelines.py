# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import mysql.connector
class EtfScraperPipeline:
    def open_spider(self, spider):
        import mysql.connector
        self.conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="etf_db"
        )
        self.cursor = self.conn.cursor()

    def close_spider(self, spider):
        self.cursor.close()
        self.conn.close()

    def process_item(self, item, spider):
        # Nettoyage des données
        def to_float(value):
            try:
                return float(value.replace('%', '').replace(',', '').strip())
            except:
                return 0.0

        def parse_volume(vol):
            if not vol:
                return 0
            vol = vol.upper().replace(',', '').strip()
            if "M" in vol:
                return float(vol.replace("M", "")) * 1_000_000
            elif "K" in vol:
                return float(vol.replace("K", "")) * 1_000
            else:
                return to_float(vol)

        price = to_float(item.get('price', '0'))
        change = to_float(item.get('change', '0'))
        change_percent = to_float(item.get('change_percent', '0'))
        volume = parse_volume(item.get('volume', '0'))

        # Insertion dans MySQL
        self.cursor.execute("""
            INSERT INTO etfs (symbol, name, price, price_change, change_percent, volume)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            item.get('symbol', ''),
            item.get('name', ''),
            price,
            change,
            change_percent,
            volume
        ))
        self.conn.commit()
        return item
