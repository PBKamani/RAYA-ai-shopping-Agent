from .product_tools import (
    search_products,
    get_product_details,
    check_stock,
    check_product_stock,
    compare_products,
    get_product_categories,
    find_sale_products,
    find_products_by_color,
    find_products_by_budget,
    find_alternatives,
    cross_category_recommendations,
    recommend_products,
)
from .cart_tools import (
    get_cart,
    add_to_cart,
    remove_from_cart,
    update_cart_quantity,
    clear_cart,
    calculate_cart_total,
)
from .wishlist_tools import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    check_wishlist,
)
from .order_tools import (
    get_order_status,
    check_order_status,
    get_user_orders,
)
from .review_tools import (
    get_product_reviews,
    summarize_product_reviews,
)

all_tools = [
    search_products,
    get_product_details,
    check_stock,
    compare_products,
    get_product_categories,
    find_sale_products,
    find_products_by_color,
    find_products_by_budget,
    find_alternatives,
    cross_category_recommendations,
    recommend_products,
    get_cart,
    add_to_cart,
    remove_from_cart,
    update_cart_quantity,
    clear_cart,
    calculate_cart_total,
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    check_wishlist,
    get_order_status,
    get_user_orders,
    get_product_reviews,
    summarize_product_reviews,
]
