import { hooks } from "@bigcommerce/stencil-utils";
import CatalogPage from "./catalog";
import compareProducts from "./global/compare-products";
import FacetedSearch from "./common/faceted-search";
import { createTranslationDictionary } from "../theme/common/utils/translations-utils";

export default class Category extends CatalogPage {
  constructor(context) {
    super(context);
    this.validationDictionary = createTranslationDictionary(context);
  }

  setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
    $element.attr({
      role: roleType,
      "aria-live": ariaLiveStatus,
    });
  }

  makeShopByPriceFilterAccessible() {
    if (!$("[data-shop-by-price]").length) return;

    if ($(".navList-action").hasClass("is-active")) {
      $("a.navList-action.is-active").focus();
    }

    $("a.navList-action").on("click", () =>
      this.setLiveRegionAttributes(
        $("span.price-filter-message"),
        "status",
        "assertive"
      )
    );
  }

  onReady() {
    this.arrangeFocusOnSortBy();

    $('[data-button-type="add-cart"]').on("click", (e) =>
      this.setLiveRegionAttributes(
        $(e.currentTarget).next(),
        "status",
        "polite"
      )
    );

    this.makeShopByPriceFilterAccessible();

    compareProducts(this.context.urls);

    if ($("#facetedSearch").length > 0) {
      this.initFacetedSearch();
    } else {
      this.onSortBySubmit = this.onSortBySubmit.bind(this);
      hooks.on("sortBy-submitted", this.onSortBySubmit);
    }

    $("a.reset-btn").on("click", () =>
      this.setLiveRegionsAttributes($("span.reset-message"), "status", "polite")
    );

    $("button#addToCart").on("click", () => {
      const arrElProducts = $("[data-product-id]");

      $.each(arrElProducts, function (index, currentProduct) {
        const productId = currentProduct.getAttribute("data-product-id");

        $.get(`/cart.php?action=add&product_id=${productId}`, function (data) {
          if (index === arrElProducts.length - 1) {
            alert(
              "All of the items in this category page have been added to the cart."
            );
            window.location = "/cart.php";
          }
        }).fail(function () {
          alert("There was an issue with loading your items to the cart.");
        });
      });
    });

    $("button#removeFromCart").on("click", () => {
      fetch("/api/storefront/cart", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then(function (arrCarts) {
          const cartId = arrCarts[0].id;
          fetch(`/api/storefront/cart/${cartId}`, {
            method: "DELETE",
            credentials: "include",
          }).then((response) => {
            console.log("Delete response", response);
            const status = response.status.toString();
            if (status[0] !== "2") {
              alert("There was an error with emptying your cart.");
              throw new Error("Unexpected delete response.");
            } else {
              alert("Your cart was successfully emptied.");
              location.reload();
            }
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

    this.ariaNotifyNoProducts();
  }

  ariaNotifyNoProducts() {
    const $noProductsMessage = $("[data-no-products-notification]");
    if ($noProductsMessage.length) {
      $noProductsMessage.focus();
    }
  }

  initFacetedSearch() {
    const {
      price_min_evaluation: onMinPriceError,
      price_max_evaluation: onMaxPriceError,
      price_min_not_entered: minPriceNotEntered,
      price_max_not_entered: maxPriceNotEntered,
      price_invalid_value: onInvalidPrice,
    } = this.validationDictionary;
    const $productListingContainer = $("#product-listing-container");
    const $facetedSearchContainer = $("#faceted-search-container");
    const productsPerPage = this.context.categoryProductsPerPage;
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true,
          products: {
            limit: productsPerPage,
          },
        },
      },
      template: {
        productListing: "category/product-listing",
        sidebar: "category/sidebar",
      },
      showMore: "category/show-more",
    };

    this.facetedSearch = new FacetedSearch(
      requestOptions,
      (content) => {
        $productListingContainer.html(content.productListing);
        $facetedSearchContainer.html(content.sidebar);

        $("body").triggerHandler("compareReset");

        $("html, body").animate(
          {
            scrollTop: 0,
          },
          100
        );
      },
      {
        validationErrorMessages: {
          onMinPriceError,
          onMaxPriceError,
          minPriceNotEntered,
          maxPriceNotEntered,
          onInvalidPrice,
        },
      }
    );
  }
}
