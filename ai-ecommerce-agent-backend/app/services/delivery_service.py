from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from ..models.delivery import Delivery


class DeliveryService:

    @staticmethod
    def generate_delivery_schedule(order_date: datetime) -> Dict[str, Any]:
        """
        Simulates the RAYA ATELIER central warehouse fulfillment timeline:
        - Confirmation: +1 day
        - Processing: +2 days
        - Shipped: +4 days
        - Out for Delivery: +5 days
        - Delivered: +6 days (total ~6 days)
        """
        confirmation_date = order_date + timedelta(days=1)
        processing_date = order_date + timedelta(days=2)
        shipped_date = order_date + timedelta(days=4)
        out_for_delivery_date = order_date + timedelta(days=5)
        delivered_date = order_date + timedelta(days=6)
        estimated_delivery_date = delivered_date

        return {
            "status": "ORDER_PLACED",
            "confirmation_date": confirmation_date,
            "processing_date": processing_date,
            "shipped_date": shipped_date,
            "out_for_delivery_date": out_for_delivery_date,
            "delivered_date": delivered_date,
            "estimated_delivery_date": estimated_delivery_date,
        }

    @staticmethod
    def create_order_delivery(order_id: int, order_date: datetime) -> Delivery:
        """Instantiates and returns a Delivery model for a new order."""
        schedule = DeliveryService.generate_delivery_schedule(order_date)
        return Delivery(
            order_id=order_id,
            status=schedule["status"],
            confirmation_date=schedule["confirmation_date"],
            processing_date=schedule["processing_date"],
            shipped_date=schedule["shipped_date"],
            out_for_delivery_date=schedule["out_for_delivery_date"],
            delivered_date=schedule["delivered_date"],
            estimated_delivery_date=schedule["estimated_delivery_date"],
        )
