---
name: neuro-shopify-liquid
description: Shopify Liquid expert - advanced templating, filters, objects, tags, metafields, metaobjects, section schemas, snippet patterns, performance optimization, and Liquid 2.0 best practices
trigger: auto
globs:
  - "**/*.liquid"
  - "**/sections/*.liquid"
  - "**/snippets/*.liquid"
  - "**/templates/*.json"
  - "**/layout/*.liquid"
  - "**/blocks/*.liquid"
  - "**/config/settings_schema.json"
  - "**/locales/*.json"
---

# Shopify Liquid Expert Skill

You are a Shopify Liquid expert. You MUST write correct, performant, production-ready Liquid code. NEVER guess at filter names or object properties — use only what is documented here. ALWAYS prefer Online Store 2.0 patterns.

---

## 1. Liquid Objects Reference

Objects are accessed with double curly braces `{{ object.property }}`. Objects are available globally, within specific templates, or as properties of other objects.

### Global Objects (available everywhere)

```liquid
{{ shop.name }}
{{ shop.url }}
{{ shop.currency }}
{{ shop.locale }}
{{ shop.metafields.namespace.key }}
{{ shop.money_format }}
{{ shop.money_with_currency_format }}
{{ shop.enabled_currencies }}
{{ shop.enabled_locales }}
{{ shop.published_locales }}

{{ request.host }}
{{ request.path }}
{{ request.page_type }}
{{ request.locale }}
{{ request.design_mode }}
{{ request.origin }}

{{ settings.color_primary }}
{{ settings.logo }}

{{ content_for_header }}
{{ canonical_url }}
{{ template }}
{{ template.name }}
{{ template.suffix }}
{{ template.directory }}

{{ page_title }}
{{ page_description }}
{{ page_image }}

{{ routes.root_url }}
{{ routes.account_url }}
{{ routes.account_login_url }}
{{ routes.account_logout_url }}
{{ routes.account_register_url }}
{{ routes.account_addresses_url }}
{{ routes.collections_url }}
{{ routes.all_products_collection_url }}
{{ routes.search_url }}
{{ routes.cart_url }}

{{ linklists['main-menu'] }}
{{ linklists['footer'] }}

{{ localization.available_countries }}
{{ localization.available_languages }}
{{ localization.country }}
{{ localization.language }}
{{ localization.market }}
```

### Product Object

```liquid
{{ product.id }}
{{ product.title }}
{{ product.handle }}
{{ product.description }}
{{ product.vendor }}
{{ product.type }}
{{ product.url }}
{{ product.price }}
{{ product.price_min }}
{{ product.price_max }}
{{ product.price_varies }}
{{ product.compare_at_price }}
{{ product.compare_at_price_min }}
{{ product.compare_at_price_max }}
{{ product.compare_at_price_varies }}
{{ product.available }}
{{ product.selected_or_first_available_variant }}
{{ product.selected_variant }}
{{ product.has_only_default_variant }}
{{ product.options }}
{{ product.options_with_values }}
{{ product.tags }}
{{ product.images }}
{{ product.featured_image }}
{{ product.featured_media }}
{{ product.media }}
{{ product.variants }}
{{ product.collections }}
{{ product.template_suffix }}
{{ product.metafields.namespace.key }}
{{ product.requires_selling_plan }}
{{ product.selling_plan_groups }}
{{ product.quantity_price_breaks_configured? }}
```

### Variant Object

```liquid
{{ variant.id }}
{{ variant.title }}
{{ variant.price }}
{{ variant.compare_at_price }}
{{ variant.sku }}
{{ variant.barcode }}
{{ variant.available }}
{{ variant.inventory_quantity }}
{{ variant.inventory_management }}
{{ variant.inventory_policy }}
{{ variant.weight }}
{{ variant.weight_unit }}
{{ variant.url }}
{{ variant.image }}
{{ variant.featured_image }}
{{ variant.featured_media }}
{{ variant.option1 }}
{{ variant.option2 }}
{{ variant.option3 }}
{{ variant.selected }}
{{ variant.requires_shipping }}
{{ variant.taxable }}
{{ variant.metafields.namespace.key }}
{{ variant.selling_plan_allocations }}
{{ variant.quantity_price_breaks }}
{{ variant.quantity_rule }}
{{ variant.store_availabilities }}
```

### Collection Object

```liquid
{{ collection.id }}
{{ collection.title }}
{{ collection.handle }}
{{ collection.description }}
{{ collection.url }}
{{ collection.image }}
{{ collection.products }}
{{ collection.products_count }}
{{ collection.all_products_count }}
{{ collection.all_tags }}
{{ collection.all_types }}
{{ collection.all_vendors }}
{{ collection.current_type }}
{{ collection.current_vendor }}
{{ collection.sort_by }}
{{ collection.default_sort_by }}
{{ collection.sort_options }}
{{ collection.filters }}
{{ collection.template_suffix }}
{{ collection.metafields.namespace.key }}
```

### Cart Object

```liquid
{{ cart.item_count }}
{{ cart.items }}
{{ cart.items_subtotal_price }}
{{ cart.total_price }}
{{ cart.total_discount }}
{{ cart.total_weight }}
{{ cart.note }}
{{ cart.attributes }}
{{ cart.original_total_price }}
{{ cart.requires_shipping }}
{{ cart.currency }}
{{ cart.cart_level_discount_applications }}
{{ cart.discount_applications }}
{{ cart.taxes_included }}
{{ cart.duties_included }}
```

### Line Item Object

```liquid
{{ item.id }}
{{ item.key }}
{{ item.product_id }}
{{ item.variant_id }}
{{ item.product }}
{{ item.variant }}
{{ item.title }}
{{ item.quantity }}
{{ item.price }}
{{ item.original_price }}
{{ item.final_price }}
{{ item.line_price }}
{{ item.original_line_price }}
{{ item.final_line_price }}
{{ item.total_discount }}
{{ item.discounts }}
{{ item.discount_allocations }}
{{ item.sku }}
{{ item.url }}
{{ item.image }}
{{ item.properties }}
{{ item.selling_plan_allocation }}
{{ item.unit_price }}
{{ item.unit_price_measurement }}
```

### Customer Object

```liquid
{{ customer.id }}
{{ customer.email }}
{{ customer.first_name }}
{{ customer.last_name }}
{{ customer.name }}
{{ customer.phone }}
{{ customer.tags }}
{{ customer.orders }}
{{ customer.orders_count }}
{{ customer.total_spent }}
{{ customer.addresses }}
{{ customer.default_address }}
{{ customer.has_account }}
{{ customer.accepts_marketing }}
{{ customer.tax_exempt }}
```

### Other Key Objects

```liquid
{%- comment -%} Page {%- endcomment -%}
{{ page.id }}
{{ page.title }}
{{ page.handle }}
{{ page.content }}
{{ page.url }}
{{ page.author }}
{{ page.template_suffix }}
{{ page.metafields.namespace.key }}

{%- comment -%} Article / Blog {%- endcomment -%}
{{ article.id }}
{{ article.title }}
{{ article.handle }}
{{ article.url }}
{{ article.content }}
{{ article.excerpt }}
{{ article.excerpt_or_content }}
{{ article.author }}
{{ article.image }}
{{ article.published_at }}
{{ article.tags }}
{{ article.comments }}
{{ article.comments_count }}
{{ article.comment_post_url }}
{{ article.metafields.namespace.key }}

{{ blog.id }}
{{ blog.title }}
{{ blog.handle }}
{{ blog.url }}
{{ blog.articles }}
{{ blog.articles_count }}
{{ blog.all_tags }}
{{ blog.comments_enabled? }}
{{ blog.moderated? }}

{%- comment -%} Order (customer account context) {%- endcomment -%}
{{ order.id }}
{{ order.name }}
{{ order.order_number }}
{{ order.created_at }}
{{ order.total_price }}
{{ order.subtotal_price }}
{{ order.total_tax }}
{{ order.total_discounts }}
{{ order.shipping_price }}
{{ order.line_items }}
{{ order.financial_status }}
{{ order.fulfillment_status }}
{{ order.shipping_address }}
{{ order.billing_address }}
{{ order.cancelled }}
{{ order.cancel_reason }}
{{ order.customer_url }}
{{ order.discount_applications }}
{{ order.transactions }}

{%- comment -%} Theme / Section / Block {%- endcomment -%}
{{ theme.id }}
{{ theme.name }}
{{ theme.role }}
{{ section.id }}
{{ section.settings.setting_id }}
{{ section.blocks }}
{{ section.index }}
{{ section.index0 }}
{{ section.location }}
{{ block.id }}
{{ block.type }}
{{ block.settings.setting_id }}
{{ block.shopify_attributes }}

{%- comment -%} Search {%- endcomment -%}
{{ search.terms }}
{{ search.results }}
{{ search.results_count }}
{{ search.performed }}
{{ search.types }}
{{ search.filters }}

{%- comment -%} Predictive Search {%- endcomment -%}
{{ predictive_search.resources }}
{{ predictive_search.terms }}

{%- comment -%} all_products (use sparingly — 20 product limit) {%- endcomment -%}
{{ all_products['product-handle'].title }}
```

---

## 2. Liquid Tags

### Conditional Tags

```liquid
{%- comment -%} if / elsif / else {%- endcomment -%}
{% if product.available %}
  <span class="in-stock">In Stock</span>
{% elsif product.compare_at_price %}
  <span class="sold-out">Sold Out (was {{ product.compare_at_price | money }})</span>
{% else %}
  <span class="unavailable">Unavailable</span>
{% endif %}

{%- comment -%} unless — inverse of if {%- endcomment -%}
{% unless product.available %}
  <span class="sold-out">Sold Out</span>
{% endunless %}

{%- comment -%} case / when {%- endcomment -%}
{% case template.name %}
  {% when 'product' %}
    {% render 'product-schema' %}
  {% when 'collection' %}
    {% render 'collection-schema' %}
  {% when 'index' %}
    {% render 'homepage-schema' %}
  {% else %}
    {% render 'default-schema' %}
{% endcase %}

{%- comment -%} Operators: ==, !=, <, >, <=, >=, or, and, contains {%- endcomment -%}
{% if product.tags contains 'sale' and product.available %}
  <span class="sale-badge">Sale</span>
{% endif %}

{% if product.type == 'T-Shirt' or product.type == 'Hoodie' %}
  {% render 'size-chart' %}
{% endif %}
```

### Iteration Tags

```liquid
{%- comment -%} for loop with all options {%- endcomment -%}
{% for product in collection.products limit: 4 offset: 2 %}
  {{ product.title }}
{% endfor %}

{%- comment -%} reversed {%- endcomment -%}
{% for tag in product.tags reversed %}
  {{ tag }}
{% endfor %}

{%- comment -%} forloop object properties {%- endcomment -%}
{% for item in cart.items %}
  {{ forloop.index }}      {%- comment -%} 1-based index {%- endcomment -%}
  {{ forloop.index0 }}     {%- comment -%} 0-based index {%- endcomment -%}
  {{ forloop.rindex }}     {%- comment -%} reverse 1-based index {%- endcomment -%}
  {{ forloop.rindex0 }}    {%- comment -%} reverse 0-based index {%- endcomment -%}
  {{ forloop.first }}      {%- comment -%} true on first iteration {%- endcomment -%}
  {{ forloop.last }}       {%- comment -%} true on last iteration {%- endcomment -%}
  {{ forloop.length }}     {%- comment -%} total iterations {%- endcomment -%}
  {{ forloop.parentloop }} {%- comment -%} parent forloop in nested loops {%- endcomment -%}
{% endfor %}

{%- comment -%} else for empty loops {%- endcomment -%}
{% for product in collection.products %}
  {{ product.title }}
{% else %}
  <p>No products found.</p>
{% endfor %}

{%- comment -%} Range loop {%- endcomment -%}
{% for i in (1..5) %}
  {{ i }}
{% endfor %}

{%- comment -%} cycle — alternate values each iteration {%- endcomment -%}
{% for product in collection.products %}
  <div class="{% cycle 'odd', 'even' %}">
    {{ product.title }}
  </div>
{% endfor %}

{%- comment -%} tablerow {%- endcomment -%}
<table>
  {% tablerow product in collection.products cols: 3 limit: 9 %}
    {{ product.title }}
  {% endtablerow %}
</table>
```

### Variable Tags

```liquid
{%- comment -%} assign — store a single value {%- endcomment -%}
{% assign featured_product = all_products['classic-tee'] %}
{% assign on_sale = false %}
{% if product.compare_at_price > product.price %}
  {% assign on_sale = true %}
{% endif %}

{%- comment -%} capture — store a block of rendered content {%- endcomment -%}
{% capture product_card_html %}
  <div class="product-card">
    <h3>{{ product.title }}</h3>
    <span>{{ product.price | money }}</span>
  </div>
{% endcapture %}
{{ product_card_html }}

{%- comment -%} increment / decrement — auto-incrementing counters {%- endcomment -%}
{% increment my_counter %}  {%- comment -%} outputs 0, then 1, then 2... {%- endcomment -%}
{% decrement my_counter %}  {%- comment -%} outputs -1, then -2, then -3... {%- endcomment -%}
```

### Theme Tags

```liquid
{%- comment -%} render — include a snippet with isolated scope (ALWAYS use this) {%- endcomment -%}
{% render 'product-card', product: product, show_vendor: true %}
{% render 'icon', icon_name: 'cart', size: 24 %}

{%- comment -%} render with for — render snippet for each item {%- endcomment -%}
{% render 'product-card' for collection.products as product %}

{%- comment -%} include — DEPRECATED, do NOT use in new code {%- endcomment -%}
{%- comment -%} {% include 'snippet' %} — leaks scope, slower {%- endcomment -%}

{%- comment -%} layout — set or disable layout {%- endcomment -%}
{% layout 'checkout' %}
{% layout none %}

{%- comment -%} content_for — template injection points (layout only) {%- endcomment -%}
{{ content_for_layout }}
{{ content_for_header }}

{%- comment -%} paginate {%- endcomment -%}
{% paginate collection.products by 24 %}
  {% for product in collection.products %}
    {% render 'product-card', product: product %}
  {% endfor %}

  {{ paginate | default_pagination }}
  {%- comment -%} Or custom pagination: {%- endcomment -%}
  {% if paginate.previous %}
    <a href="{{ paginate.previous.url }}">Previous</a>
  {% endif %}
  {% for part in paginate.parts %}
    {% if part.is_link %}
      <a href="{{ part.url }}">{{ part.title }}</a>
    {% else %}
      <span class="current">{{ part.title }}</span>
    {% endif %}
  {% endfor %}
  {% if paginate.next %}
    <a href="{{ paginate.next.url }}">Next</a>
  {% endif %}
{% endpaginate %}

{%- comment -%} form tag {%- endcomment -%}
{% form 'product', product %}
  <select name="id">
    {% for variant in product.variants %}
      <option value="{{ variant.id }}" {% if variant == product.selected_or_first_available_variant %}selected{% endif %}>
        {{ variant.title }} - {{ variant.price | money }}
      </option>
    {% endfor %}
  </select>
  <button type="submit" {% unless product.available %}disabled{% endunless %}>
    {% if product.available %}Add to Cart{% else %}Sold Out{% endif %}
  </button>
{% endform %}

{% form 'customer_login' %}
  <input type="email" name="customer[email]">
  <input type="password" name="customer[password]">
  <button type="submit">Sign In</button>
{% endform %}

{% form 'contact' %}
  <input type="email" name="contact[email]" required>
  <textarea name="contact[body]"></textarea>
  <button type="submit">Send</button>
{% endform %}

{% form 'create_customer' %}{% endform %}
{% form 'recover_customer_password' %}{% endform %}
{% form 'reset_customer_password' %}{% endform %}
{% form 'customer_address', customer.new_address %}{% endform %}
{% form 'activate_customer_password' %}{% endform %}
{% form 'new_comment', article %}{% endform %}
{% form 'storefront_password' %}{% endform %}
{% form 'guest_login' %}{% endform %}
{% form 'currency' %}{% endform %}
{% form 'localization' %}{% endform %}

{%- comment -%} comment {%- endcomment -%}
{% comment %}This will not be rendered{% endcomment %}
{%- comment -%}This also strips whitespace{%- endcomment -%}

{%- comment -%} raw — output Liquid syntax as text {%- endcomment -%}
{% raw %}
  {{ this.will.not.be.processed }}
{% endraw %}

{%- comment -%} liquid — multi-line tag without repeated delimiters {%- endcomment -%}
{% liquid
  assign product_title = product.title | upcase
  if product.available
    echo product_title
  else
    echo 'Sold Out'
  endif
%}
```

### Section-Specific Tags

```liquid
{%- comment -%} schema — define section settings (JSON, one per section) {%- endcomment -%}
{% schema %}
{
  "name": "Featured Product",
  "settings": [
    {
      "type": "product",
      "id": "product",
      "label": "Product"
    }
  ]
}
{% endschema %}

{%- comment -%} stylesheet — section-scoped CSS (DEPRECATED — use CSS in schema or external files) {%- endcomment -%}
{% stylesheet %}
  .my-section { color: red; }
{% endstylesheet %}

{%- comment -%} javascript — section-scoped JS (DEPRECATED — use external files) {%- endcomment -%}
{% javascript %}
  console.log('section loaded');
{% endjavascript %}

{%- comment -%} style — inline dynamic styles {%- endcomment -%}
{% style %}
  #shopify-section-{{ section.id }} {
    background-color: {{ section.settings.bg_color }};
    padding: {{ section.settings.padding }}px 0;
  }
{% endstyle %}
```

---

## 3. Liquid Filters -- String

You MUST chain filters with the pipe `|` operator. Filters evaluate left to right.

```liquid
{{ 'hello' | append: ' world' }}                 {%- comment -%} "hello world" {%- endcomment -%}
{{ 'world' | prepend: 'hello ' }}                 {%- comment -%} "hello world" {%- endcomment -%}
{{ 'hello' | capitalize }}                        {%- comment -%} "Hello" {%- endcomment -%}
{{ 'hello' | upcase }}                            {%- comment -%} "HELLO" {%- endcomment -%}
{{ 'HELLO' | downcase }}                          {%- comment -%} "hello" {%- endcomment -%}
{{ '  hello  ' | strip }}                         {%- comment -%} "hello" {%- endcomment -%}
{{ '  hello  ' | lstrip }}                        {%- comment -%} "hello  " {%- endcomment -%}
{{ '  hello  ' | rstrip }}                        {%- comment -%} "  hello" {%- endcomment -%}
{{ '<p>Hello</p>' | strip_html }}                 {%- comment -%} "Hello" {%- endcomment -%}
{{ "Hello\nWorld" | strip_newlines }}              {%- comment -%} "HelloWorld" {%- endcomment -%}
{{ '<script>' | escape }}                         {%- comment -%} "&lt;script&gt;" {%- endcomment -%}
{{ 'hello world' | url_encode }}                  {%- comment -%} "hello+world" {%- endcomment -%}
{{ 'hello+world' | url_decode }}                  {%- comment -%} "hello world" {%- endcomment -%}
{{ 'hello' | base64_encode }}                     {%- comment -%} "aGVsbG8=" {%- endcomment -%}
{{ 'aGVsbG8=' | base64_decode }}                  {%- comment -%} "hello" {%- endcomment -%}
{{ 'hello' | md5 }}                               {%- comment -%} MD5 hash {%- endcomment -%}
{{ 'hello' | sha256 }}                            {%- comment -%} SHA-256 hash {%- endcomment -%}
{{ 'hello' | hmac_sha256: 'secret' }}             {%- comment -%} HMAC-SHA-256 {%- endcomment -%}
{{ "Hello\nWorld" | newline_to_br }}              {%- comment -%} "Hello<br>\nWorld" {%- endcomment -%}
{{ 'Hello World' | replace: 'World', 'Liquid' }}  {%- comment -%} "Hello Liquid" {%- endcomment -%}
{{ 'aabbcc' | replace_first: 'a', 'x' }}         {%- comment -%} "xabbcc" {%- endcomment -%}
{{ 'Hello World' | remove: 'World' }}             {%- comment -%} "Hello " {%- endcomment -%}
{{ 'aabbcc' | remove_first: 'a' }}               {%- comment -%} "abbcc" {%- endcomment -%}
{{ 'hello' | slice: 1, 3 }}                       {%- comment -%} "ell" {%- endcomment -%}
{{ 'one,two,three' | split: ',' }}                {%- comment -%} array: ["one","two","three"] {%- endcomment -%}
{{ 'Hello World' | truncate: 8 }}                 {%- comment -%} "Hello..." {%- endcomment -%}
{{ 'Hello World' | truncate: 8, '---' }}          {%- comment -%} "Hello---" {%- endcomment -%}
{{ 'The quick brown fox' | truncatewords: 2 }}    {%- comment -%} "The quick..." {%- endcomment -%}
{{ 'Hello World' | handleize }}                   {%- comment -%} "hello-world" {%- endcomment -%}
{{ 'Hello World' | handle }}                      {%- comment -%} "hello-world" (alias) {%- endcomment -%}
{{ 'car' | pluralize: 'car', 'cars' }}            {%- comment -%} depends on count {%- endcomment -%}
{{ 'some_text' | camelcase }}                     {%- comment -%} "SomeText" {%- endcomment -%}
{{ 'hello' | escape_once }}                       {%- comment -%} escapes only unescaped chars {%- endcomment -%}
```

---

## 4. Liquid Filters -- Math

```liquid
{{ 4 | plus: 2 }}           {%- comment -%} 6 {%- endcomment -%}
{{ 4 | minus: 2 }}          {%- comment -%} 2 {%- endcomment -%}
{{ 4 | times: 3 }}          {%- comment -%} 12 {%- endcomment -%}
{{ 10 | divided_by: 3 }}    {%- comment -%} 3 (integer division!) {%- endcomment -%}
{{ 10 | divided_by: 3.0 }}  {%- comment -%} 3.333... (float division) {%- endcomment -%}
{{ 10 | modulo: 3 }}        {%- comment -%} 1 {%- endcomment -%}
{{ 1.5 | round }}           {%- comment -%} 2 {%- endcomment -%}
{{ 1.234 | round: 2 }}      {%- comment -%} 1.23 {%- endcomment -%}
{{ 1.2 | ceil }}            {%- comment -%} 2 {%- endcomment -%}
{{ 1.8 | floor }}           {%- comment -%} 1 {%- endcomment -%}
{{ -5 | abs }}              {%- comment -%} 5 {%- endcomment -%}
{{ 3 | at_least: 5 }}       {%- comment -%} 5 (returns max of value and argument) {%- endcomment -%}
{{ 8 | at_most: 5 }}        {%- comment -%} 5 (returns min of value and argument) {%- endcomment -%}
```

**IMPORTANT:** `divided_by` with two integers returns an integer. You MUST use a float divisor (`3.0`) for decimal results.

---

## 5. Liquid Filters -- Array

```liquid
{% assign fruits = 'apple,banana,cherry' | split: ',' %}

{{ fruits | join: ', ' }}           {%- comment -%} "apple, banana, cherry" {%- endcomment -%}
{{ fruits | first }}                {%- comment -%} "apple" {%- endcomment -%}
{{ fruits | last }}                 {%- comment -%} "cherry" {%- endcomment -%}
{{ fruits | size }}                 {%- comment -%} 3 {%- endcomment -%}
{{ fruits | sort }}                 {%- comment -%} alphabetical sort {%- endcomment -%}
{{ fruits | sort_natural }}         {%- comment -%} case-insensitive sort {%- endcomment -%}
{{ fruits | reverse }}              {%- comment -%} reversed array {%- endcomment -%}
{{ fruits | compact }}              {%- comment -%} removes nil values {%- endcomment -%}
{{ fruits | uniq }}                 {%- comment -%} removes duplicates {%- endcomment -%}
{{ fruits | slice: 0, 2 }}          {%- comment -%} first 2 items {%- endcomment -%}

{%- comment -%} map — extract a property from each item {%- endcomment -%}
{{ collection.products | map: 'title' | join: ', ' }}

{%- comment -%} where — filter array by property value {%- endcomment -%}
{% assign available_products = collection.products | where: 'available', true %}
{% assign sale_products = collection.products | where: 'compare_at_price_min', '>', 0 %}

{%- comment -%} concat — combine two arrays {%- endcomment -%}
{% assign all_items = collection1.products | concat: collection2.products %}

{%- comment -%} sort by a property {%- endcomment -%}
{% assign sorted = collection.products | sort: 'price' %}
{% assign sorted_natural = collection.products | sort_natural: 'title' %}
```

---

## 6. Liquid Filters -- Money

You MUST use money filters for all price output. NEVER manually format prices.

```liquid
{{ product.price | money }}                          {%- comment -%} "$10.00" (store format) {%- endcomment -%}
{{ product.price | money_with_currency }}             {%- comment -%} "$10.00 USD" {%- endcomment -%}
{{ product.price | money_without_trailing_zeros }}    {%- comment -%} "$10" {%- endcomment -%}
{{ product.price | money_without_currency }}          {%- comment -%} "10.00" {%- endcomment -%}

{%- comment -%} Prices are in cents in Liquid. 1000 = $10.00 {%- endcomment -%}
{%- comment -%} The money filters handle the conversion automatically. {%- endcomment -%}

{%- comment -%} Compare-at-price display {%- endcomment -%}
{% if product.compare_at_price > product.price %}
  <s>{{ product.compare_at_price | money }}</s>
  <strong>{{ product.price | money }}</strong>
  {% assign savings = product.compare_at_price | minus: product.price %}
  <span class="savings">Save {{ savings | money }}</span>
{% else %}
  {{ product.price | money }}
{% endif %}

{%- comment -%} Unit pricing {%- endcomment -%}
{% if variant.unit_price %}
  <span class="unit-price">
    {{ variant.unit_price | money }} /
    {% if variant.unit_price_measurement.reference_value != 1 %}
      {{ variant.unit_price_measurement.reference_value }}
    {% endif %}
    {{ variant.unit_price_measurement.reference_unit }}
  </span>
{% endif %}
```

---

## 7. Liquid Filters -- Date

```liquid
{{ article.published_at | date: '%B %d, %Y' }}       {%- comment -%} "January 15, 2026" {%- endcomment -%}
{{ article.published_at | date: '%Y-%m-%d' }}         {%- comment -%} "2026-01-15" {%- endcomment -%}
{{ article.published_at | date: '%b %d, %Y' }}        {%- comment -%} "Jan 15, 2026" {%- endcomment -%}
{{ article.published_at | date: '%A, %B %e, %Y' }}   {%- comment -%} "Thursday, January 15, 2026" {%- endcomment -%}
{{ article.published_at | date: '%I:%M %p' }}         {%- comment -%} "02:30 PM" {%- endcomment -%}
{{ article.published_at | date: '%H:%M:%S' }}         {%- comment -%} "14:30:00" {%- endcomment -%}
{{ 'now' | date: '%Y-%m-%d' }}                        {%- comment -%} Current date {%- endcomment -%}
{{ 'now' | date: '%s' }}                              {%- comment -%} Unix timestamp {%- endcomment -%}

{%- comment -%} Date format tokens {%- endcomment -%}
{%- comment -%} %Y = 4-digit year, %y = 2-digit year {%- endcomment -%}
{%- comment -%} %m = month 01-12, %B = full month name, %b = abbreviated {%- endcomment -%}
{%- comment -%} %d = day 01-31, %e = day 1-31 (no leading zero) {%- endcomment -%}
{%- comment -%} %A = full weekday, %a = abbreviated weekday {%- endcomment -%}
{%- comment -%} %H = hour 00-23, %I = hour 01-12, %M = minute, %S = second {%- endcomment -%}
{%- comment -%} %p = AM/PM, %Z = timezone {%- endcomment -%}

{%- comment -%} time_tag filter — generates <time> HTML element {%- endcomment -%}
{{ article.published_at | time_tag }}
{{ article.published_at | time_tag: '%B %d, %Y' }}
{{ article.published_at | time_tag: format: 'date' }}
{{ article.published_at | time_tag: format: 'abbreviated_date' }}
```

---

## 8. Liquid Filters -- Media / Image

You MUST use `image_url` + `image_tag` for all images. NEVER use deprecated `img_url` or `img_tag`.

### image_url Filter

Returns a Shopify CDN URL. You MUST specify at least `width` or `height`.

```liquid
{%- comment -%} Basic width {%- endcomment -%}
{{ product | image_url: width: 600 }}
{{ product.featured_image | image_url: width: 800 }}
{{ section.settings.image | image_url: width: 1200 }}

{%- comment -%} Width and height (with crop) {%- endcomment -%}
{{ product | image_url: width: 400, height: 400, crop: 'center' }}

{%- comment -%} Crop options: top, center, bottom, left, right {%- endcomment -%}
{{ product | image_url: width: 600, height: 400, crop: 'top' }}

{%- comment -%} Region crop (precise area) {%- endcomment -%}
{{ product | image_url: width: 400, height: 400, crop: 'region', crop_left: 100, crop_top: 50, crop_width: 400, crop_height: 400 }}

{%- comment -%} Format conversion {%- endcomment -%}
{{ product | image_url: width: 600, format: 'pjpg' }}

{%- comment -%} Padding (when aspect ratio changes) {%- endcomment -%}
{{ product | image_url: width: 400, height: 400, pad_color: 'ffffff' }}

{%- comment -%} Maximum: 5760px for either dimension {%- endcomment -%}
{%- comment -%} Shopify auto-serves WebP/AVIF when browser supports them {%- endcomment -%}
```

### image_tag Filter

Generates a complete `<img>` element with responsive attributes.

```liquid
{%- comment -%} Basic usage {%- endcomment -%}
{{ product | image_url: width: 600 | image_tag }}

{%- comment -%} With alt text, class, loading {%- endcomment -%}
{{ product | image_url: width: 600 | image_tag:
    alt: product.featured_image.alt,
    class: 'product-image',
    loading: 'lazy' }}

{%- comment -%} Responsive with widths and sizes {%- endcomment -%}
{{ product | image_url: width: 1200 | image_tag:
    widths: '300, 450, 600, 750, 900, 1200',
    sizes: '(min-width: 1200px) 600px, (min-width: 750px) 50vw, 100vw' }}

{%- comment -%} Above-the-fold hero image with fetchpriority {%- endcomment -%}
{{ section.settings.hero_image | image_url: width: 1920 | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    widths: '375, 750, 1100, 1500, 1920',
    sizes: '100vw',
    preload: true }}

{%- comment -%} Custom srcset (or disable it) {%- endcomment -%}
{{ product | image_url: width: 600 | image_tag: srcset: nil }}

{%- comment -%} Override dimensions {%- endcomment -%}
{{ product | image_url: width: 600 | image_tag: width: 300, height: nil }}

{%- comment -%} Inline styles {%- endcomment -%}
{{ product | image_url: width: 600 | image_tag:
    style: 'object-fit: cover; aspect-ratio: 1/1;',
    class: 'product-thumb rounded' }}
```

### Responsive Image Pattern (Best Practice)

```liquid
{%- comment -%} Full responsive product image with picture element for art direction {%- endcomment -%}
<picture>
  <source
    media="(max-width: 749px)"
    srcset="
      {{ product.featured_image | image_url: width: 375 }} 375w,
      {{ product.featured_image | image_url: width: 750 }} 750w"
    sizes="100vw">
  {{ product.featured_image | image_url: width: 1200 | image_tag:
      widths: '600, 900, 1200',
      sizes: '(min-width: 1200px) 600px, 50vw',
      loading: 'lazy',
      alt: product.featured_image.alt | escape }}
</picture>
```

### Other Media Filters

```liquid
{%- comment -%} External video (YouTube/Vimeo) {%- endcomment -%}
{{ external_video | external_video_tag }}
{{ external_video | external_video_url: autoplay: true, loop: true, mute: true }}
{{ external_video | external_video_tag: loading: 'lazy' }}

{%- comment -%} Generic media tag (handles images, video, 3D models) {%- endcomment -%}
{% for media in product.media %}
  {{ media | media_tag }}
{% endfor %}

{%- comment -%} 3D model viewer {%- endcomment -%}
{{ media | model_viewer_tag: alt: 'Product 3D Model' }}

{%- comment -%} Video tag {%- endcomment -%}
{{ media | video_tag: autoplay: true, loop: true, muted: true, controls: true }}
```

---

## 9. Liquid Filters -- Color

```liquid
{%- comment -%} Color conversion {%- endcomment -%}
{{ '#ff6600' | color_to_rgb }}          {%- comment -%} "rgb(255, 102, 0)" {%- endcomment -%}
{{ '#ff6600' | color_to_hsl }}          {%- comment -%} "hsl(24, 100%, 50%)" {%- endcomment -%}
{{ 'rgb(255, 102, 0)' | color_to_hex }} {%- comment -%} "#ff6600" {%- endcomment -%}

{%- comment -%} Color modification {%- endcomment -%}
{{ '#ff6600' | color_modify: 'alpha', 0.5 }}     {%- comment -%} "rgba(255, 102, 0, 0.5)" {%- endcomment -%}
{{ '#ff6600' | color_modify: 'red', 200 }}       {%- comment -%} modifies red channel {%- endcomment -%}
{{ '#ff6600' | color_modify: 'hue', 180 }}       {%- comment -%} modifies hue {%- endcomment -%}
{{ '#ff6600' | color_modify: 'saturation', 80 }} {%- comment -%} modifies saturation {%- endcomment -%}

{%- comment -%} Color mixing {%- endcomment -%}
{{ '#ff0000' | color_mix: '#0000ff', 50 }}       {%- comment -%} 50% mix {%- endcomment -%}

{%- comment -%} Color analysis {%- endcomment -%}
{{ '#ff6600' | color_contrast: '#ffffff' }}       {%- comment -%} contrast ratio (number) {%- endcomment -%}
{{ '#ff6600' | color_brightness }}                {%- comment -%} brightness 0-255 {%- endcomment -%}

{%- comment -%} Lighten / Darken (amount 0-100) {%- endcomment -%}
{{ '#ff6600' | color_lighten: 20 }}
{{ '#ff6600' | color_darken: 20 }}

{%- comment -%} Saturate / Desaturate (amount 0-100) {%- endcomment -%}
{{ '#ff6600' | color_saturate: 30 }}
{{ '#ff6600' | color_desaturate: 30 }}

{%- comment -%} Extract a single component {%- endcomment -%}
{{ '#ff6600' | color_extract: 'red' }}            {%- comment -%} 255 {%- endcomment -%}
{{ '#ff6600' | color_extract: 'hue' }}            {%- comment -%} 24 {%- endcomment -%}
{{ '#ff6600' | color_extract: 'saturation' }}
{{ '#ff6600' | color_extract: 'lightness' }}
{{ '#ff6600' | color_extract: 'alpha' }}

{%- comment -%} Dynamic text color based on background contrast {%- endcomment -%}
{% assign bg_color = section.settings.bg_color %}
{% assign text_color_on_bg = bg_color | color_contrast: '#ffffff' %}
{% if text_color_on_bg < 4.5 %}
  {% assign text_color = '#000000' %}
{% else %}
  {% assign text_color = '#ffffff' %}
{% endif %}
```

---

## 10. Liquid Filters -- URL

### Asset URLs

```liquid
{%- comment -%} Theme asset (in assets/ directory) {%- endcomment -%}
{{ 'style.css' | asset_url }}
{{ 'script.js' | asset_url }}
{{ 'logo.png' | asset_url }}

{%- comment -%} File asset (uploaded via Settings > Files) {%- endcomment -%}
{{ 'size-chart.pdf' | file_url }}
{{ 'banner.jpg' | file_img_url: '1200x' }}

{%- comment -%} Shopify global/shared assets {%- endcomment -%}
{{ 'shopify_common.js' | shopify_asset_url }}
{{ 'option_selection.js' | shopify_asset_url }}
{{ 'api.jquery.js' | shopify_asset_url }}

{%- comment -%} Global assets (hosted on Shopify CDN) {%- endcomment -%}
{{ 'jquery.js' | global_asset_url }}

{%- comment -%} Font URL {%- endcomment -%}
{{ settings.heading_font | font_url }}
{{ settings.heading_font | font_face }}
{{ settings.heading_font | font_face: font_display: 'swap' }}
{{ settings.heading_font | font_modify: 'weight', 'bold' }}
{{ settings.heading_font | font_modify: 'style', 'italic' }}
```

### Link Generation

```liquid
{%- comment -%} link_to — generate <a> tag {%- endcomment -%}
{{ 'Sale' | link_to: collection.url, class: 'nav-link' }}

{%- comment -%} Vendor / Type links {%- endcomment -%}
{{ product.vendor | link_to_vendor }}
{{ product.type | link_to_type }}
{{ product.vendor | url_for_vendor }}
{{ product.type | url_for_type }}

{%- comment -%} Collection-scoped URL {%- endcomment -%}
{{ product.url | within: collection }}

{%- comment -%} Payment type image {%- endcomment -%}
{{ 'visa' | payment_type_img_url }}
{{ 'mastercard' | payment_type_img_url }}
{{ 'paypal' | payment_type_img_url }}

{%- comment -%} Script and stylesheet tags {%- endcomment -%}
{{ 'theme.css' | asset_url | stylesheet_tag }}
{{ 'theme.js' | asset_url | script_tag }}

{%- comment -%} Preload tags {%- endcomment -%}
{{ 'theme.css' | asset_url | stylesheet_tag: preload: true }}

{%- comment -%} Deprecated: img_url (use image_url instead) {%- endcomment -%}
{%- comment -%} {{ product | img_url: '300x300' }} — DO NOT USE {%- endcomment -%}
```

---

## 11. Metafields in Liquid

### Access Patterns

```liquid
{%- comment -%} Standard access: resource.metafields.namespace.key {%- endcomment -%}
{{ product.metafields.custom.care_instructions }}
{{ product.metafields.custom.care_instructions.value }}
{{ product.metafields.custom.care_instructions.type }}

{%- comment -%} Available on: product, variant, collection, page, article, blog, shop, order, customer {%- endcomment -%}
{{ collection.metafields.custom.banner_image }}
{{ page.metafields.custom.sidebar_content }}
{{ shop.metafields.custom.announcement_text }}
{{ customer.metafields.custom.loyalty_tier }}
```

### Metafield Types and Usage

```liquid
{%- comment -%} single_line_text_field {%- endcomment -%}
{{ product.metafields.custom.subtitle.value }}

{%- comment -%} multi_line_text_field — preserve line breaks {%- endcomment -%}
{{ product.metafields.custom.long_description.value | newline_to_br }}

{%- comment -%} rich_text_field — outputs HTML {%- endcomment -%}
{{ product.metafields.custom.rich_description.value }}

{%- comment -%} number_integer / number_decimal {%- endcomment -%}
{{ product.metafields.custom.weight_kg.value }}
{% if product.metafields.custom.rating.value > 4 %}
  <span class="top-rated">Top Rated</span>
{% endif %}

{%- comment -%} boolean {%- endcomment -%}
{% if product.metafields.custom.is_new_arrival.value == true %}
  <span class="badge-new">New</span>
{% endif %}

{%- comment -%} date / date_time {%- endcomment -%}
{{ product.metafields.custom.release_date.value | date: '%B %d, %Y' }}

{%- comment -%} color {%- endcomment -%}
<div style="background-color: {{ product.metafields.custom.swatch_color.value }};">
  {{ product.metafields.custom.swatch_color.value }}
</div>

{%- comment -%} url {%- endcomment -%}
<a href="{{ product.metafields.custom.external_link.value }}">External Link</a>

{%- comment -%} json — access as object {%- endcomment -%}
{% assign specs = product.metafields.custom.specifications.value %}
{{ specs.material }}
{{ specs.dimensions.width }} x {{ specs.dimensions.height }}
{% for key_value in specs %}
  <dt>{{ key_value[0] }}</dt>
  <dd>{{ key_value[1] }}</dd>
{% endfor %}

{%- comment -%} file_reference — image {%- endcomment -%}
{% if product.metafields.custom.size_chart_image.value != blank %}
  {{ product.metafields.custom.size_chart_image.value | image_url: width: 800 | image_tag:
      alt: 'Size Chart',
      loading: 'lazy' }}
{% endif %}

{%- comment -%} product_reference {%- endcomment -%}
{% assign related = product.metafields.custom.related_product.value %}
{% if related %}
  <a href="{{ related.url }}">{{ related.title }} - {{ related.price | money }}</a>
{% endif %}

{%- comment -%} collection_reference {%- endcomment -%}
{% assign featured_collection = product.metafields.custom.featured_in.value %}
{% if featured_collection %}
  <a href="{{ featured_collection.url }}">{{ featured_collection.title }}</a>
{% endif %}

{%- comment -%} variant_reference {%- endcomment -%}
{% assign recommended_variant = product.metafields.custom.recommended_variant.value %}

{%- comment -%} page_reference {%- endcomment -%}
{% assign faq_page = product.metafields.custom.faq_page.value %}
{% if faq_page %}
  {{ faq_page.content }}
{% endif %}

{%- comment -%} metaobject_reference — see section 12 {%- endcomment -%}

{%- comment -%} List types (list.single_line_text_field, list.product_reference, etc.) {%- endcomment -%}
{% for feature in product.metafields.custom.features.value %}
  <li>{{ feature }}</li>
{% endfor %}

{% for related_product in product.metafields.custom.related_products.value %}
  {% render 'product-card', product: related_product %}
{% endfor %}

{%- comment -%} metafield_tag filter — auto-renders metafield with appropriate HTML {%- endcomment -%}
{{ product.metafields.custom.care_instructions | metafield_tag }}
{{ product.metafields.custom.size_chart_image | metafield_tag }}
{{ product.metafields.custom.related_products | metafield_tag }}
```

### Checking Metafield Existence

```liquid
{%- comment -%} ALWAYS check for blank before rendering {%- endcomment -%}
{% if product.metafields.custom.subtitle != blank %}
  <p class="product-subtitle">{{ product.metafields.custom.subtitle.value }}</p>
{% endif %}

{%- comment -%} For list metafields, check size {%- endcomment -%}
{% if product.metafields.custom.features.value.size > 0 %}
  <ul>
    {% for feature in product.metafields.custom.features.value %}
      <li>{{ feature }}</li>
    {% endfor %}
  </ul>
{% endif %}
```

---

## 12. Metaobjects in Liquid

Metaobjects are reusable structured content entries. They MUST be created in the Shopify admin or via the API before use.

### Accessing via Metafield Reference

```liquid
{%- comment -%} Single metaobject reference metafield on a product {%- endcomment -%}
{% assign designer = product.metafields.custom.designer.value %}
{% if designer %}
  <div class="designer-info">
    <h3>{{ designer.name.value }}</h3>
    <p>{{ designer.bio.value }}</p>
    {% if designer.portrait.value != blank %}
      {{ designer.portrait.value | image_url: width: 200 | image_tag: loading: 'lazy' }}
    {% endif %}
  </div>
{% endif %}

{%- comment -%} List of metaobject references {%- endcomment -%}
{% for ingredient in product.metafields.custom.ingredients.value %}
  <div class="ingredient">
    <strong>{{ ingredient.name.value }}</strong>
    <p>{{ ingredient.description.value }}</p>
    {% if ingredient.icon.value != blank %}
      {{ ingredient.icon.value | image_url: width: 48 | image_tag }}
    {% endif %}
  </div>
{% endfor %}
```

### Metaobjects as Dynamic Sources

Metaobjects with **storefront access** enabled become dynamic sources. Merchants connect them in the theme editor via the "Connect dynamic source" icon.

```liquid
{%- comment -%} In a section, metaobject fields connect to settings {%- endcomment -%}
{%- comment -%} The theme editor handles the connection — no Liquid code needed for wiring {%- endcomment -%}

{%- comment -%} Section template receives values through settings {%- endcomment -%}
<div class="testimonial">
  {% if section.settings.author_image != blank %}
    {{ section.settings.author_image | image_url: width: 100 | image_tag: class: 'testimonial-avatar' }}
  {% endif %}
  <blockquote>{{ section.settings.quote }}</blockquote>
  <cite>{{ section.settings.author_name }}</cite>
</div>

{% schema %}
{
  "name": "Testimonial",
  "settings": [
    {
      "type": "text",
      "id": "quote",
      "label": "Quote"
    },
    {
      "type": "text",
      "id": "author_name",
      "label": "Author Name"
    },
    {
      "type": "image_picker",
      "id": "author_image",
      "label": "Author Image"
    }
  ]
}
{% endschema %}
```

### Nested Metaobjects

```liquid
{%- comment -%} Accessing nested metaobject references {%- endcomment -%}
{% assign product_material = product.metafields.custom.material.value %}
{% if product_material %}
  <h4>{{ product_material.name.value }}</h4>
  <p>{{ product_material.description.value }}</p>

  {%- comment -%} Nested: material has a metaobject_reference to supplier {%- endcomment -%}
  {% assign supplier = product_material.supplier.value %}
  {% if supplier %}
    <p>Sourced from: {{ supplier.company_name.value }}</p>
    <p>Origin: {{ supplier.country.value }}</p>
  {% endif %}
{% endif %}
```

---

## 13. Section Schema Deep Dive

### Complete Setting Types Reference

```json
{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "custom-section-class",
  "limit": 1,
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome",
      "placeholder": "Enter heading text",
      "info": "Displayed at the top of the section"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "Enter description here",
      "placeholder": "Your description"
    },
    {
      "type": "richtext",
      "id": "rich_content",
      "label": "Rich Content",
      "default": "<p>Default <strong>rich</strong> content</p>"
    },
    {
      "type": "inline_richtext",
      "id": "inline_text",
      "label": "Inline Rich Text",
      "default": "Bold and <em>italic</em> text"
    },
    {
      "type": "number",
      "id": "columns",
      "label": "Number of Columns",
      "default": 3,
      "info": "Between 1 and 6"
    },
    {
      "type": "range",
      "id": "padding",
      "label": "Section Padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 40
    },
    {
      "type": "checkbox",
      "id": "show_vendor",
      "label": "Show product vendor",
      "default": false
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Layout",
      "default": "grid",
      "options": [
        { "value": "grid", "label": "Grid" },
        { "value": "list", "label": "List" },
        { "value": "carousel", "label": "Carousel" }
      ]
    },
    {
      "type": "radio",
      "id": "alignment",
      "label": "Text Alignment",
      "default": "center",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ]
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text Color",
      "default": "#333333"
    },
    {
      "type": "color_background",
      "id": "bg_gradient",
      "label": "Background Gradient",
      "default": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color Scheme",
      "default": "scheme-1"
    },
    {
      "type": "font_picker",
      "id": "heading_font",
      "label": "Heading Font",
      "default": "helvetica_n4"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Image"
    },
    {
      "type": "video",
      "id": "video",
      "label": "Video"
    },
    {
      "type": "video_url",
      "id": "video_url",
      "label": "Video URL",
      "accept": ["youtube", "vimeo"]
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button Link"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
    {
      "type": "product",
      "id": "featured_product",
      "label": "Featured Product"
    },
    {
      "type": "blog",
      "id": "blog",
      "label": "Blog"
    },
    {
      "type": "page",
      "id": "info_page",
      "label": "Information Page"
    },
    {
      "type": "article",
      "id": "featured_article",
      "label": "Featured Article"
    },
    {
      "type": "link_list",
      "id": "menu",
      "label": "Menu"
    },
    {
      "type": "liquid",
      "id": "custom_liquid",
      "label": "Custom Liquid"
    },
    {
      "type": "html",
      "id": "custom_html",
      "label": "Custom HTML"
    },
    {
      "type": "header",
      "content": "Layout Settings"
    },
    {
      "type": "paragraph",
      "content": "Configure the visual layout of this section."
    }
  ],
  "blocks": [
    {
      "type": "slide",
      "name": "Slide",
      "limit": 8,
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Slide Image"
        },
        {
          "type": "text",
          "id": "heading",
          "label": "Heading",
          "default": "Slide Heading"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Text"
        },
        {
          "type": "url",
          "id": "link",
          "label": "Link"
        }
      ]
    },
    {
      "type": "@app"
    }
  ],
  "max_blocks": 12,
  "presets": [
    {
      "name": "Slideshow",
      "category": "Image",
      "settings": {
        "layout": "carousel",
        "padding": 60
      },
      "blocks": [
        {
          "type": "slide",
          "settings": {
            "heading": "Slide 1"
          }
        },
        {
          "type": "slide",
          "settings": {
            "heading": "Slide 2"
          }
        }
      ]
    }
  ],
  "enabled_on": {
    "templates": ["*"],
    "groups": ["header", "footer"]
  }
}
{% endschema %}
```

### Using Section and Block Settings

```liquid
{%- comment -%} Section settings {%- endcomment -%}
<section
  id="section-{{ section.id }}"
  class="custom-section {{ section.settings.layout }} color-{{ section.settings.color_scheme }}"
  style="padding: {{ section.settings.padding }}px 0;"
>
  {% if section.settings.heading != blank %}
    <h2 style="color: {{ section.settings.text_color }}; font-family: {{ section.settings.heading_font.family }}, {{ section.settings.heading_font.fallback_families }};">
      {{ section.settings.heading }}
    </h2>
  {% endif %}

  {%- comment -%} Block rendering — ALWAYS iterate section.blocks {%- endcomment -%}
  {% for block in section.blocks %}
    {%- comment -%} block.shopify_attributes is REQUIRED for theme editor functionality {%- endcomment -%}
    <div {{ block.shopify_attributes }}>
      {% case block.type %}
        {% when 'slide' %}
          {% if block.settings.image != blank %}
            {{ block.settings.image | image_url: width: 1200 | image_tag:
                alt: block.settings.heading,
                loading: 'lazy',
                class: 'slide-image' }}
          {% endif %}
          {% if block.settings.heading != blank %}
            <h3>{{ block.settings.heading }}</h3>
          {% endif %}
          {% if block.settings.text != blank %}
            <p>{{ block.settings.text }}</p>
          {% endif %}
        {% when '@app' %}
          {% render block %}
      {% endcase %}
    </div>
  {% endfor %}
</section>
```

### enabled_on / disabled_on

```json
{
  "enabled_on": {
    "templates": ["product", "collection"],
    "groups": ["body"]
  }
}

{
  "disabled_on": {
    "templates": ["password"],
    "groups": ["header", "footer", "aside"]
  }
}
```

You MUST NOT use both `enabled_on` and `disabled_on` on the same section. Use `"*"` as a wildcard for all templates or groups.

### visible_if (Conditional Settings)

```json
{
  "type": "checkbox",
  "id": "show_button",
  "label": "Show button",
  "default": false
},
{
  "type": "text",
  "id": "button_text",
  "label": "Button text",
  "default": "Learn More",
  "visible_if": "{{ section.settings.show_button }}"
}
```

---

## 14. Performance Patterns

### assign vs capture

```liquid
{%- comment -%} GOOD: assign for simple values {%- endcomment -%}
{% assign sale_price = product.price | money %}

{%- comment -%} GOOD: capture for complex HTML blocks {%- endcomment -%}
{% capture price_html %}
  {% if product.compare_at_price > product.price %}
    <s class="compare-price">{{ product.compare_at_price | money }}</s>
    <span class="sale-price">{{ product.price | money }}</span>
  {% else %}
    <span class="regular-price">{{ product.price | money }}</span>
  {% endif %}
{% endcapture %}
{%- comment -%} Now use {{ price_html }} multiple times without re-evaluating {%- endcomment -%}
```

### Single-Loop Capture Pattern

```liquid
{%- comment -%} BAD: looping variants multiple times {%- endcomment -%}
{%- comment -%}
{% for variant in product.variants %}
  render swatch
{% endfor %}
{% for variant in product.variants %}
  render option
{% endfor %}
{%- endcomment -%}

{%- comment -%} GOOD: single loop, capture multiple outputs {%- endcomment -%}
{% capture swatch_html %}{% endcapture %}
{% capture option_html %}{% endcapture %}

{% for variant in product.variants %}
  {% capture swatch_html %}
    {{ swatch_html }}
    <div class="swatch" data-variant-id="{{ variant.id }}" style="background-color: {{ variant.option1 | handleize }};">
      <span class="sr-only">{{ variant.option1 }}</span>
    </div>
  {% endcapture %}

  {% capture option_html %}
    {{ option_html }}
    <option value="{{ variant.id }}" {% unless variant.available %}disabled{% endunless %}>
      {{ variant.title }} - {{ variant.price | money }}
    </option>
  {% endcapture %}
{% endfor %}

<div class="swatches">{{ swatch_html }}</div>
<select name="id">{{ option_html }}</select>
```

### render vs include

```liquid
{%- comment -%} ALWAYS use render — isolated scope, better performance {%- endcomment -%}
{% render 'product-card', product: product, show_vendor: section.settings.show_vendor %}

{%- comment -%} NEVER use include — leaks scope, slower, deprecated {%- endcomment -%}
{%- comment -%} {% include 'product-card' %} — DO NOT USE {%- endcomment -%}

{%- comment -%} render with for — more efficient than Liquid for loop + render {%- endcomment -%}
{% render 'product-card' for collection.products as product %}
```

### Whitespace Control

```liquid
{%- comment -%} ALWAYS use {%- -%} and {{- -}} to strip whitespace {%- endcomment -%}

{%- comment -%} BAD: generates excess whitespace in HTML {%- endcomment -%}
{% assign title = product.title %}
{{ title }}

{%- comment -%} GOOD: clean output {%- endcomment -%}
{%- assign title = product.title -%}
{{- title -}}
```

### Variable Caching

```liquid
{%- comment -%} GOOD: cache expensive lookups outside loops {%- endcomment -%}
{%- assign current_variant = product.selected_or_first_available_variant -%}
{%- assign featured_image = product.featured_image -%}
{%- assign product_form_id = 'product-form-' | append: section.id -%}

{%- comment -%} BAD: accessing product.selected_or_first_available_variant in every iteration {%- endcomment -%}
```

### Lazy Loading Strategy

```liquid
{%- comment -%} First image above fold: eager load with high priority {%- endcomment -%}
{{ product.featured_image | image_url: width: 800 | image_tag:
    loading: 'eager',
    fetchpriority: 'high',
    preload: true }}

{%- comment -%} All other images: lazy load {%- endcomment -%}
{% for image in product.images offset: 1 %}
  {{ image | image_url: width: 800 | image_tag:
      loading: 'lazy' }}
{% endfor %}
```

### Filter Chaining Efficiency

```liquid
{%- comment -%} GOOD: chain filters in a single expression {%- endcomment -%}
{{ product.description | strip_html | truncatewords: 20 | escape }}

{%- comment -%} BAD: assigning intermediate variables unnecessarily {%- endcomment -%}
{%- comment -%}
{% assign stripped = product.description | strip_html %}
{% assign truncated = stripped | truncatewords: 20 %}
{{ truncated | escape }}
{%- endcomment -%}
```

### JSON Output for JavaScript

```liquid
{%- comment -%} ALWAYS use the json filter for passing data to JS {%- endcomment -%}
<script type="application/json" id="product-data-{{ section.id }}">
  {{ product | json }}
</script>

{%- comment -%} Selective data for smaller payloads {%- endcomment -%}
<script type="application/json" id="variant-data-{{ section.id }}">
  {{ product.variants | json }}
</script>

{%- comment -%} NEVER interpolate raw Liquid into JS strings — XSS risk {%- endcomment -%}
{%- comment -%} BAD: var title = "{{ product.title }}"; {%- endcomment -%}
{%- comment -%} GOOD: {%- endcomment -%}
<script>
  const data = JSON.parse(document.getElementById('product-data-{{ section.id }}').textContent);
</script>
```

### Limit Collection Loops

```liquid
{%- comment -%} ALWAYS use limit on collection loops when showing a subset {%- endcomment -%}
{% for product in collection.products limit: 8 %}
  {% render 'product-card', product: product %}
{% endfor %}

{%- comment -%} ALWAYS paginate when showing all products {%- endcomment -%}
{% paginate collection.products by 24 %}
  {% for product in collection.products %}
    {% render 'product-card', product: product %}
  {% endfor %}
  {{ paginate | default_pagination }}
{% endpaginate %}
```

---

## 15. Common Patterns

### Product Card Snippet (snippets/product-card.liquid)

```liquid
{%- comment -%}
  Renders a product card.
  Accepts:
  - product: {Object} Product Liquid object
  - show_vendor: {Boolean} Show vendor name (default: false)
  - lazy_load: {Boolean} Lazy load image (default: true)
  - image_aspect_ratio: {String} 'square', 'portrait', 'landscape', 'natural'
  Usage:
  {% render 'product-card', product: product, show_vendor: true %}
{%- endcomment -%}

{%- liquid
  assign lazy_load = lazy_load | default: true
  assign image_aspect_ratio = image_aspect_ratio | default: 'natural'
  assign current_variant = product.selected_or_first_available_variant
-%}

<div class="product-card">
  <a href="{{ product.url }}" class="product-card__link" aria-label="{{ product.title | escape }}">
    <div class="product-card__media aspect-ratio--{{ image_aspect_ratio }}">
      {%- if product.featured_image != blank -%}
        {{ product.featured_image | image_url: width: 600 | image_tag:
            widths: '165, 360, 535, 600',
            sizes: '(min-width: 1200px) 275px, (min-width: 750px) calc((100vw - 130px) / 4), calc((100vw - 35px) / 2)',
            loading: lazy_load | ternary: 'lazy', 'eager',
            alt: product.featured_image.alt | escape,
            class: 'product-card__image' }}
      {%- else -%}
        {{ 'product-1' | placeholder_svg_tag: 'product-card__placeholder' }}
      {%- endif -%}

      {%- if product.compare_at_price > product.price -%}
        {%- assign savings_pct = product.compare_at_price | minus: product.price | times: 100.0 | divided_by: product.compare_at_price | round -%}
        <span class="product-card__badge badge--sale">-{{ savings_pct }}%</span>
      {%- endif -%}

      {%- unless product.available -%}
        <span class="product-card__badge badge--soldout">{{ 'products.product.sold_out' | t }}</span>
      {%- endunless -%}
    </div>

    <div class="product-card__info">
      {%- if show_vendor -%}
        <span class="product-card__vendor">{{ product.vendor }}</span>
      {%- endif -%}

      <h3 class="product-card__title">{{ product.title | escape }}</h3>

      <div class="product-card__price">
        {%- if product.compare_at_price > product.price -%}
          <s class="product-card__compare-price">{{ product.compare_at_price | money }}</s>
          <span class="product-card__sale-price">{{ product.price | money }}</span>
        {%- elsif product.price_varies -%}
          <span>{{ 'products.product.from_price' | t: price: product.price_min | money }}</span>
        {%- else -%}
          <span>{{ product.price | money }}</span>
        {%- endif -%}
      </div>

      {%- if current_variant.unit_price -%}
        <span class="product-card__unit-price">
          {{ current_variant.unit_price | money }} /
          {%- if current_variant.unit_price_measurement.reference_value != 1 -%}
            {{ current_variant.unit_price_measurement.reference_value }}
          {%- endif -%}
          {{ current_variant.unit_price_measurement.reference_unit }}
        </span>
      {%- endif -%}
    </div>
  </a>
</div>
```

### Variant Selector

```liquid
{%- unless product.has_only_default_variant -%}
  <variant-selects
    id="variant-selects-{{ section.id }}"
    data-section="{{ section.id }}"
    data-url="{{ product.url }}"
    {{ block.shopify_attributes }}
  >
    {% for option in product.options_with_values %}
      <div class="product-form__option">
        <label for="Option-{{ section.id }}-{{ forloop.index0 }}">
          {{ option.name }}
        </label>
        <select
          id="Option-{{ section.id }}-{{ forloop.index0 }}"
          name="options[{{ option.name | escape }}]"
          class="product-form__select"
        >
          {% for value in option.values %}
            <option
              value="{{ value | escape }}"
              {% if option.selected_value == value %}selected="selected"{% endif %}
            >
              {{ value }}
            </option>
          {% endfor %}
        </select>
      </div>
    {% endfor %}

    <script type="application/json">
      {{ product.variants | json }}
    </script>
  </variant-selects>
{%- endunless -%}
```

### Collection Filtering (Storefront Filtering API)

```liquid
{%- comment -%} OS 2.0 Storefront Filtering {%- endcomment -%}
{% for filter in collection.filters %}
  <details class="filter-group" {% if filter.active_values.size > 0 %}open{% endif %}>
    <summary>{{ filter.label }}</summary>
    <div class="filter-group__content">
      {% case filter.type %}
        {% when 'list' %}
          <ul class="filter-list">
            {% for value in filter.values %}
              <li>
                <label>
                  <input
                    type="checkbox"
                    name="{{ value.param_name }}"
                    value="{{ value.value }}"
                    {% if value.active %}checked{% endif %}
                    {% if value.count == 0 and value.active == false %}disabled{% endif %}
                  >
                  {{ value.label }} ({{ value.count }})
                </label>
              </li>
            {% endfor %}
          </ul>
        {% when 'price_range' %}
          <div class="filter-price-range">
            <input type="number"
              name="{{ filter.min_value.param_name }}"
              min="0"
              max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
              value="{{ filter.min_value.value | money_without_currency | replace: ',', '' }}"
              placeholder="0">
            <span>to</span>
            <input type="number"
              name="{{ filter.max_value.param_name }}"
              min="0"
              max="{{ filter.range_max | money_without_currency | replace: ',', '' }}"
              value="{{ filter.max_value.value | money_without_currency | replace: ',', '' }}"
              placeholder="{{ filter.range_max | money_without_currency | replace: ',', '' }}">
          </div>
      {% endcase %}
    </div>
  </details>
{% endfor %}

{%- comment -%} Active filter tags {%- endcomment -%}
{% for filter in collection.filters %}
  {% for value in filter.active_values %}
    <a href="{{ value.url_to_remove }}" class="active-filter">
      {{ filter.label }}: {{ value.label }} &times;
    </a>
  {% endfor %}
{% endfor %}
```

### Pagination

```liquid
{% paginate collection.products by 24 %}
  <div class="collection-grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product, lazy_load: true %}
    {% endfor %}
  </div>

  {% if paginate.pages > 1 %}
    <nav class="pagination" aria-label="Pagination">
      {% if paginate.previous %}
        <a href="{{ paginate.previous.url }}" aria-label="Previous page">&laquo; Previous</a>
      {% endif %}

      {% for part in paginate.parts %}
        {% if part.is_link %}
          <a href="{{ part.url }}">{{ part.title }}</a>
        {% elsif part.title == paginate.current_page %}
          <span class="pagination__current" aria-current="page">{{ part.title }}</span>
        {% else %}
          <span class="pagination__ellipsis">{{ part.title }}</span>
        {% endif %}
      {% endfor %}

      {% if paginate.next %}
        <a href="{{ paginate.next.url }}" aria-label="Next page">Next &raquo;</a>
      {% endif %}
    </nav>
  {% endif %}
{% endpaginate %}
```

### Breadcrumbs

```liquid
{%- comment -%} snippets/breadcrumbs.liquid {%- endcomment -%}
{% unless template.name == 'index' %}
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="{{ routes.root_url }}" itemprop="item">
          <span itemprop="name">{{ 'general.breadcrumbs.home' | t }}</span>
        </a>
        <meta itemprop="position" content="1">
      </li>

      {% case template.name %}
        {% when 'product' %}
          {% if collection %}
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
              <a href="{{ collection.url }}" itemprop="item">
                <span itemprop="name">{{ collection.title }}</span>
              </a>
              <meta itemprop="position" content="2">
            </li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
              <span itemprop="name">{{ product.title }}</span>
              <meta itemprop="position" content="3">
            </li>
          {% else %}
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
              <span itemprop="name">{{ product.title }}</span>
              <meta itemprop="position" content="2">
            </li>
          {% endif %}

        {% when 'collection' %}
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
            <span itemprop="name">{{ collection.title }}</span>
            <meta itemprop="position" content="2">
          </li>

        {% when 'blog' %}
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
            <span itemprop="name">{{ blog.title }}</span>
            <meta itemprop="position" content="2">
          </li>

        {% when 'article' %}
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="{{ blog.url }}" itemprop="item">
              <span itemprop="name">{{ blog.title }}</span>
            </a>
            <meta itemprop="position" content="2">
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
            <span itemprop="name">{{ article.title }}</span>
            <meta itemprop="position" content="3">
          </li>

        {% when 'page' %}
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
            <span itemprop="name">{{ page.title }}</span>
            <meta itemprop="position" content="2">
          </li>

        {% when 'search' %}
          <li aria-current="page">{{ 'general.breadcrumbs.search' | t }}</li>

        {% when 'cart' %}
          <li aria-current="page">{{ 'general.breadcrumbs.cart' | t }}</li>
      {% endcase %}
    </ol>
  </nav>
{% endunless %}
```

### Mega Menu from Linklist

```liquid
{%- comment -%} Multi-level navigation from a linklist {%- endcomment -%}
{% assign main_menu = linklists['main-menu'] %}

<nav class="main-nav" role="navigation" aria-label="Main navigation">
  <ul class="main-nav__list">
    {% for link in main_menu.links %}
      <li class="main-nav__item {% if link.links.size > 0 %}has-dropdown{% endif %} {% if link.active %}is-active{% endif %}">
        <a href="{{ link.url }}" class="main-nav__link"
          {% if link.links.size > 0 %}aria-expanded="false" aria-haspopup="true"{% endif %}>
          {{ link.title }}
        </a>

        {% if link.links.size > 0 %}
          <div class="mega-menu">
            <ul class="mega-menu__list">
              {% for child_link in link.links %}
                <li class="mega-menu__item">
                  <a href="{{ child_link.url }}" class="mega-menu__heading">{{ child_link.title }}</a>
                  {% if child_link.links.size > 0 %}
                    <ul class="mega-menu__sublist">
                      {% for grandchild_link in child_link.links %}
                        <li>
                          <a href="{{ grandchild_link.url }}">{{ grandchild_link.title }}</a>
                        </li>
                      {% endfor %}
                    </ul>
                  {% endif %}
                </li>
              {% endfor %}
            </ul>
          </div>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</nav>
```

### Search Results

```liquid
{% paginate search.results by 12 %}
  {% if search.performed %}
    {% if search.results_count > 0 %}
      <p>{{ 'search.results_count' | t: count: search.results_count, terms: search.terms }}</p>
      <div class="search-results">
        {% for item in search.results %}
          {% case item.object_type %}
            {% when 'product' %}
              {% render 'product-card', product: item %}
            {% when 'article' %}
              <div class="search-result__article">
                <h3><a href="{{ item.url }}">{{ item.title }}</a></h3>
                <p>{{ item.content | strip_html | truncatewords: 30 }}</p>
                <time datetime="{{ item.published_at | date: '%Y-%m-%d' }}">
                  {{ item.published_at | date: '%B %d, %Y' }}
                </time>
              </div>
            {% when 'page' %}
              <div class="search-result__page">
                <h3><a href="{{ item.url }}">{{ item.title }}</a></h3>
                <p>{{ item.content | strip_html | truncatewords: 30 }}</p>
              </div>
          {% endcase %}
        {% endfor %}
      </div>
      {{ paginate | default_pagination }}
    {% else %}
      <p>{{ 'search.no_results' | t: terms: search.terms }}</p>
    {% endif %}
  {% endif %}
{% endpaginate %}
```

### Customer Account Pages

```liquid
{%- comment -%} Customer login form {%- endcomment -%}
{% form 'customer_login' %}
  {{ form.errors | default_errors }}
  <div class="form-group">
    <label for="CustomerEmail">{{ 'customer.login.email' | t }}</label>
    <input type="email" id="CustomerEmail" name="customer[email]" autocomplete="email" required>
  </div>
  <div class="form-group">
    <label for="CustomerPassword">{{ 'customer.login.password' | t }}</label>
    <input type="password" id="CustomerPassword" name="customer[password]" autocomplete="current-password" required>
  </div>
  <button type="submit">{{ 'customer.login.sign_in' | t }}</button>
{% endform %}

{%- comment -%} Customer order history {%- endcomment -%}
{% if customer %}
  <h2>{{ 'customer.orders.title' | t }}</h2>
  {% paginate customer.orders by 20 %}
    {% if customer.orders.size > 0 %}
      <table class="orders-table">
        <thead>
          <tr>
            <th>{{ 'customer.orders.order_number' | t }}</th>
            <th>{{ 'customer.orders.date' | t }}</th>
            <th>{{ 'customer.orders.payment_status' | t }}</th>
            <th>{{ 'customer.orders.fulfillment_status' | t }}</th>
            <th>{{ 'customer.orders.total' | t }}</th>
          </tr>
        </thead>
        <tbody>
          {% for order in customer.orders %}
            <tr>
              <td><a href="{{ order.customer_url }}">{{ order.name }}</a></td>
              <td>{{ order.created_at | date: '%B %d, %Y' }}</td>
              <td>{{ order.financial_status_label }}</td>
              <td>{{ order.fulfillment_status_label }}</td>
              <td>{{ order.total_price | money }}</td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
      {{ paginate | default_pagination }}
    {% else %}
      <p>{{ 'customer.orders.none' | t }}</p>
    {% endif %}
  {% endpaginate %}
{% endif %}
```

### Cart Drawer / Cart Page Items

```liquid
{% for item in cart.items %}
  <div class="cart-item" data-key="{{ item.key }}">
    {% if item.image %}
      <a href="{{ item.url }}">
        {{ item.image | image_url: width: 150 | image_tag:
            alt: item.title | escape,
            loading: 'lazy',
            class: 'cart-item__image' }}
      </a>
    {% endif %}

    <div class="cart-item__details">
      <a href="{{ item.url }}" class="cart-item__title">{{ item.product.title }}</a>
      {% unless item.product.has_only_default_variant %}
        <p class="cart-item__variant">{{ item.variant.title }}</p>
      {% endunless %}

      {% if item.selling_plan_allocation %}
        <p class="cart-item__selling-plan">{{ item.selling_plan_allocation.selling_plan.name }}</p>
      {% endif %}

      {%- comment -%} Line item properties {%- endcomment -%}
      {% if item.properties.size > 0 %}
        <ul class="cart-item__properties">
          {% for property in item.properties %}
            {% unless property.last == blank %}
              <li>{{ property.first }}: {{ property.last }}</li>
            {% endunless %}
          {% endfor %}
        </ul>
      {% endif %}

      <div class="cart-item__price">
        {% if item.original_price != item.final_price %}
          <s>{{ item.original_price | money }}</s>
          <strong>{{ item.final_price | money }}</strong>
        {% else %}
          {{ item.original_price | money }}
        {% endif %}
      </div>

      {%- comment -%} Discount info {%- endcomment -%}
      {% for discount in item.discount_allocations %}
        <span class="cart-item__discount">
          {{ discount.discount_application.title }} (-{{ discount.amount | money }})
        </span>
      {% endfor %}

      <div class="cart-item__quantity">
        <label for="quantity-{{ item.key }}" class="sr-only">Quantity</label>
        <input
          type="number"
          id="quantity-{{ item.key }}"
          name="updates[{{ item.key }}]"
          value="{{ item.quantity }}"
          min="0"
          aria-label="Quantity for {{ item.product.title | escape }}">
      </div>

      <p class="cart-item__line-price">{{ item.final_line_price | money }}</p>
    </div>
  </div>
{% endfor %}

<div class="cart-totals">
  {% if cart.cart_level_discount_applications.size > 0 %}
    {% for discount in cart.cart_level_discount_applications %}
      <p class="cart-discount">
        {{ discount.title }} (-{{ discount.total_allocated_amount | money }})
      </p>
    {% endfor %}
  {% endif %}
  <p class="cart-subtotal">
    <span>{{ 'cart.general.subtotal' | t }}</span>
    <span>{{ cart.total_price | money_with_currency }}</span>
  </p>
</div>
```

---

## 16. Debugging

### The inspect Filter

```liquid
{%- comment -%} Use inspect to debug any object — shows type and structure {%- endcomment -%}
{{ product | inspect }}
{{ product.metafields.custom | inspect }}
{{ collection.filters | inspect }}

{%- comment -%} Wrap in <pre> for readability during development {%- endcomment -%}
{% if request.design_mode %}
  <pre style="background: #111; color: #0f0; padding: 1rem; font-size: 12px; overflow: auto;">
    {{ product | inspect }}
  </pre>
{% endif %}
```

### Blank Output Debugging

```liquid
{%- comment -%}
  If output is blank, check these common causes:
  1. Object not available in this template context
  2. Metafield namespace/key typo
  3. Metafield missing .value accessor
  4. Object is nil (not blank — different check)
  5. Incorrect template scope (render isolates variables)
{%- endcomment -%}

{%- comment -%} Debug checklist {%- endcomment -%}
{% if product == nil %}
  <!-- DEBUG: product is nil — wrong template context -->
{% elsif product == blank %}
  <!-- DEBUG: product is blank -->
{% else %}
  <!-- DEBUG: product exists, title = "{{ product.title }}" -->
{% endif %}

{%- comment -%} Check metafield existence and type {%- endcomment -%}
{% assign mf = product.metafields.custom.my_field %}
{% if mf == blank %}
  <!-- DEBUG: metafield is blank (not defined or no value) -->
{% else %}
  <!-- DEBUG: metafield type={{ mf.type }}, value={{ mf.value | inspect }} -->
{% endif %}
```

### Type Checking

```liquid
{%- comment -%} Liquid does not have a typeof — use inspect or test behavior {%- endcomment -%}
{% assign test = product.price %}
<!-- price inspect: {{ test | inspect }} -->
<!-- price type: number (prices are integers in cents) -->

{%- comment -%} String vs Number: attempt math to confirm type {%- endcomment -%}
{% assign result = test | plus: 0 %}
<!-- If this outputs the same value, it is numeric -->
```

### content_for_header Analysis

```liquid
{%- comment -%}
  {{ content_for_header }} outputs Shopify's required head scripts.
  NEVER remove it from layout/theme.liquid.
  It includes:
  - Shopify analytics/tracking
  - Content Security Policy meta tags
  - App script injections
  - Performance monitoring
  - Checkout and cart scripts

  If your page is slow, {{ content_for_header }} scripts may be a factor.
  Use Shopify Theme Inspector for Chrome to profile.
{%- endcomment -%}
```

### Design Mode Detection

```liquid
{%- comment -%} Only show debug info in the theme editor {%- endcomment -%}
{% if request.design_mode %}
  <div class="debug-panel" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); color: #0f0; padding: 1rem; z-index: 9999; font-family: monospace; font-size: 11px; max-height: 300px; overflow: auto;">
    <p>Template: {{ template.name }} | Suffix: {{ template.suffix }}</p>
    <p>Section ID: {{ section.id }}</p>
    <p>Blocks: {{ section.blocks.size }}</p>
    {% for block in section.blocks %}
      <p>Block {{ forloop.index }}: type={{ block.type }}, id={{ block.id }}</p>
    {% endfor %}
  </div>
{% endif %}
```

---

## Quick Rules

- You MUST use `{% render %}` instead of `{% include %}` in all new code.
- You MUST use `image_url` + `image_tag` instead of deprecated `img_url` / `img_tag`.
- You MUST use money filters (`| money`) for all price display. NEVER manually format currency.
- You MUST add `{{ block.shopify_attributes }}` to every block wrapper element.
- You MUST check for `blank` before rendering optional content (metafields, settings, images).
- You MUST use `{%- -%}` whitespace stripping in snippets and performance-critical sections.
- You MUST paginate collection loops — NEVER output unbounded product lists.
- You MUST use `| json` filter when passing Liquid data to JavaScript. NEVER interpolate raw Liquid into JS strings.
- You MUST use `| escape` on user-generated content (titles, descriptions, alt text).
- You MUST include `{{ content_for_header }}` in layout `<head>` — NEVER remove it.
- NEVER nest `{% schema %}` inside conditional tags — it MUST be at the top level of the section file.
- NEVER use `all_products` in loops — it has a 20-product limit and is slow.
- ALWAYS cache expensive lookups (`selected_or_first_available_variant`, `featured_image`) in `assign` before loops.
- ALWAYS set `loading: 'lazy'` on below-fold images and `loading: 'eager'` with `fetchpriority: 'high'` on hero images.
- ALWAYS use `t` filter for user-facing strings: `{{ 'key' | t }}` — NEVER hardcode display text.
