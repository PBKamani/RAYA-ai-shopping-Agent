"""Order tracking tools for the AI shopping agent."""
from langchain_core.tools import tool
from ...database import SessionLocal
from ...services.order_service import OrderService


@tool
def get_order_status(order_number: str = "", user_id: int = 1) -> str:
    """Get the status and details of an order. If order_number is provided, looks up that specific order. Otherwise returns the most recent order. Only shows orders belonging to the authenticated user."""
    db = SessionLocal()
    try:
        if order_number:
            order = OrderService.get_order_by_number(db=db, order_number=order_number)
            if not order or order.user_id != user_id:
                return "Order not found or you don't have access to this order."
        else:
            orders = OrderService.get_user_orders(db=db, user_id=user_id)
            if not orders:
                return "No orders found. You haven't placed any orders yet."
            order = orders[0]

        # Build order details
        lines = [
            f"Order Number: {order.order_number}",
            f"Status: {order.status}",
            f"Order Date: {order.order_date}",
            f"Subtotal: ${order.subtotal:.2f}",
        ]
        if order.discount > 0:
            lines.append(f"Discount: -${order.discount:.2f}")
        lines.append(f"Shipping: ${order.shipping_cost:.2f}")
        lines.append(f"Total: ${order.total:.2f}")

        if order.estimated_delivery_date:
            lines.append(f"Estimated Delivery: {order.estimated_delivery_date}")

        # Show order items
        if order.items:
            lines.append("\nItems:")
            for item in order.items:
                lines.append(
                    f"  - {item.product_title} x{item.quantity} "
                    f"(${item.subtotal:.2f})"
                )

        # Show delivery status if available
        if order.delivery:
            d = order.delivery
            lines.append(f"\nDelivery Status: {d.status}")

        return "\n".join(lines)
    except Exception as e:
        return f"Error getting order status: {e}"
    finally:
        db.close()


check_order_status = get_order_status


@tool
def get_user_orders(user_id: int = 1) -> str:
    """Get a list of all orders placed by the user. Shows order numbers, statuses, dates, and totals."""
    db = SessionLocal()
    try:
        orders = OrderService.get_user_orders(db=db, user_id=user_id)
        if not orders:
            return "No orders found. You haven't placed any orders yet."

        lines = [f"--- Your Orders ({len(orders)} total) ---"]
        for o in orders:
            lines.append(
                f"Order: {o.order_number} | Status: {o.status} "
                f"| Total: ${o.total:.2f} | Date: {o.order_date}"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Error retrieving orders: {e}"
    finally:
        db.close()
