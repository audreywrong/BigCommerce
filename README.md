## Overview of theme changes

Based on Cornerstone theme. Preview Code: xt8r7a3lzf

1. Created Special Item and Special Items category through BigCommerce GUI, and made sure to upload two images.
2. Injected alternate image into card.html and accessed image through index on image array using Handlebars. Added hover effect on alternate image selector in card.scss file.
3. Created 'Add All To Cart' button which executed a jQuery GET request on click against /cart.php. Added opposing 'Remove All Items' button that executed a DELETE request using the Fetch API on click. The request used the Storefront API to empty the cart. Thoughtful error handling and customer notification was added for both events.
4. For the bonus objective, I began by putting placeholder markup in category.html. This was to ensure that the custom banner would only show on a category page. I determined the appropriate syntax to get the customer's name by referring to contact-us.html. Customer information used included name and e-mail.
