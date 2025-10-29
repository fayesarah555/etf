# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import mysql.connector

class EtfScraperPipeline:
    def open_spider(self, spider):
        self.conn = mysql.connector.connect(
            host="localhost",
            user="root",       # mets ton user MySQL
            password="root",   # mets ton mot de passe
            database="etf_db"
        )
        self.cursor = self.conn.cursor()

    def close_spider(self, spider):
        self.conn.commit()
        self.cursor.close()
        self.conn.close()

    def process_item(self, item, spider):
        # Adapter les colonnes au schéma de ta table
        self.cursor.execute("""
            INSERT INTO etf (symbol, name, price, price_change, change_percent, volume)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            item.get("symbol"),
            item.get("name"),
            item.get("price"),
            item.get("change"),   # correspond à price_change
            item.get("change_percent"),
            item.get("volume")
        ))
        self.conn.commit()
        return item
