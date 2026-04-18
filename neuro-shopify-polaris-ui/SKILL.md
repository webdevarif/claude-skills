---
name: neuro-shopify-polaris-ui
description: Shopify Polaris React UI expert - IndexTable with sorting/filtering/bulk actions, IndexFilters with saved views, ResourceList, AppProvider, Page/Layout patterns, complex forms (FormLayout, nested resources, dynamic fields), resource index & details layouts, app settings layout, empty states, loading skeletons, error handling, responsive patterns, and Polaris design system best practices
trigger: auto
globs:
  - "**/shopify.app.toml"
  - "**/shopify.server.*"
  - "**/routes/app.*"
  - "**/*.jsx"
  - "**/*.tsx"
  - "**/polaris*"
  - "**/shopify*"
  - "**/components/**"
---

# Neuro Shopify Polaris UI

You are a senior Shopify Polaris UI expert. When building ANY Shopify app UI, you MUST follow these exact patterns and component conventions. Always use the latest `@shopify/polaris` package. Never deviate from these specifications.

---

## Table of Contents

1. [AppProvider Setup](#1-appprovider-setup)
2. [Page & Layout Patterns](#2-page--layout-patterns)
3. [Resource Index Layout](#3-resource-index-layout)
4. [IndexTable (Complete)](#4-indextable-complete)
5. [IndexFilters (Complete)](#5-indexfilters-complete)
6. [Bulk Actions](#6-bulk-actions)
7. [ResourceList](#7-resourcelist)
8. [Resource Details Layout](#8-resource-details-layout)
9. [App Settings Layout](#9-app-settings-layout)
10. [Complex Forms](#10-complex-forms)
11. [Empty States](#11-empty-states)
12. [Loading & Skeleton Patterns](#12-loading--skeleton-patterns)
13. [Error Handling UI](#13-error-handling-ui)
14. [Banner & Feedback](#14-banner--feedback)
15. [Navigation & Tabs](#15-navigation--tabs)
16. [Popover & ActionList](#16-popover--actionlist)
17. [Card Patterns](#17-card-patterns)
18. [Badge & Status](#18-badge--status)
19. [Responsive Patterns](#19-responsive-patterns)
20. [Component Reference](#20-component-reference)
21. [Constraints & Rules](#21-constraints--rules)

---

## 1. AppProvider Setup

### Required Root Wrapper
```jsx
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      {/* All Polaris components must be wrapped */}
      <Outlet />
    </AppProvider>
  );
}
```

### Remix Integration
```jsx
// app/root.jsx
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={enTranslations}>
          <Outlet />
        </AppProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

### CRITICAL:
- AppProvider MUST wrap ALL Polaris components
- Import CSS ONCE at the root level
- Inside App Bridge modals with `src`, you need a SEPARATE AppProvider
- Never nest AppProviders (except in modal iframes)

---

## 2. Page & Layout Patterns

### Standard Page
```jsx
import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

function ProductsPage() {
  return (
    <Page
      title="Products"
      primaryAction={{ content: "Add product", onAction: handleCreate }}
      secondaryActions={[
        { content: "Export", onAction: handleExport },
        { content: "Import", onAction: handleImport },
      ]}
      backAction={{ content: "Home", onAction: () => navigate("/app") }}
      fullWidth={false}  // default, constrained width
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p">Main content area</Text>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <Text as="p">Sidebar content</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### Page with Pagination
```jsx
<Page
  title="Orders"
  pagination={{
    hasPrevious: page > 1,
    hasNext: hasNextPage,
    onPrevious: () => setPage(page - 1),
    onNext: () => setPage(page + 1),
  }}
>
  {/* content */}
</Page>
```

### Full-Width Page (for tables)
```jsx
<Page title="Products" fullWidth>
  <Card padding="0">
    <IndexTable>
      {/* ... */}
    </IndexTable>
  </Card>
</Page>
```

### Two-Column Layout (InlineGrid)
```jsx
import { InlineGrid, BlockStack, Card, Box, Text } from "@shopify/polaris";

function DetailPage() {
  return (
    <Page title="Product Details">
      <InlineGrid columns={{ xs: 1, md: ["twoThirds", "oneThird"] }} gap="400">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Product info</Text>
              {/* Primary content */}
            </BlockStack>
          </Card>
          <Card>
            <Text as="h2" variant="headingMd">Media</Text>
            {/* Media section */}
          </Card>
        </BlockStack>
        <BlockStack gap="400">
          <Card>
            <Text as="h2" variant="headingMd">Status</Text>
            {/* Status/metadata */}
          </Card>
          <Card>
            <Text as="h2" variant="headingMd">Organization</Text>
            {/* Tags, categories */}
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
```

---

## 3. Resource Index Layout

### Complete Pattern (Products List)
```jsx
import {
  Page, Card, IndexTable, IndexFilters, useSetIndexFiltersMode,
  useIndexResourceState, Text, Badge, Thumbnail, InlineStack,
  useBreakpoints, ChoiceList, RangeSlider, TextField,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

function ProductsIndex() {
  // Data
  const products = [
    { id: "1", title: "T-Shirt", status: "active", inventory: 20, price: "$25.00", image: "..." },
    { id: "2", title: "Hoodie", status: "draft", inventory: 0, price: "$65.00", image: "..." },
  ];

  // Selection
  const resourceName = { singular: "product", plural: "products" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  // Filters mode
  const { mode, setMode } = useSetIndexFiltersMode();

  // Query
  const [queryValue, setQueryValue] = useState("");
  const handleQueryChange = useCallback((value) => setQueryValue(value), []);
  const handleQueryClear = useCallback(() => setQueryValue(""), []);

  // Sorting
  const [sortSelected, setSortSelected] = useState(["title asc"]);
  const sortOptions = [
    { label: "Title", value: "title asc", directionLabel: "A-Z" },
    { label: "Title", value: "title desc", directionLabel: "Z-A" },
    { label: "Price", value: "price asc", directionLabel: "Low to high" },
    { label: "Price", value: "price desc", directionLabel: "High to low" },
    { label: "Inventory", value: "inventory asc", directionLabel: "Low" },
    { label: "Inventory", value: "inventory desc", directionLabel: "High" },
  ];

  // Filters
  const [status, setStatus] = useState(undefined);
  const [productType, setProductType] = useState(undefined);

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          selected={status || []}
          onChange={setStatus}
          allowMultiple
        />
      ),
      shortcut: true,
      pinned: true,
    },
    {
      key: "productType",
      label: "Product type",
      filter: (
        <ChoiceList
          title="Product type"
          titleHidden
          choices={[
            { label: "T-Shirt", value: "tshirt" },
            { label: "Hoodie", value: "hoodie" },
          ]}
          selected={productType || []}
          onChange={setProductType}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (status && status.length > 0) {
    appliedFilters.push({
      key: "status",
      label: `Status: ${status.join(", ")}`,
      onRemove: () => setStatus(undefined),
    });
  }
  if (productType && productType.length > 0) {
    appliedFilters.push({
      key: "productType",
      label: `Type: ${productType.join(", ")}`,
      onRemove: () => setProductType(undefined),
    });
  }

  const handleClearAll = useCallback(() => {
    setStatus(undefined);
    setProductType(undefined);
  }, []);

  // Tabs / Saved Views
  const [selected, setSelected] = useState(0);
  const tabs = [
    { id: "all", content: "All", isLocked: true },
    { id: "active", content: "Active" },
    { id: "draft", content: "Draft" },
    { id: "archived", content: "Archived" },
  ];

  // Promotoed & bulk actions
  const promotedBulkActions = [
    {
      content: "Set as active",
      onAction: () => console.log("Set active:", selectedResources),
    },
  ];
  const bulkActions = [
    {
      content: "Add tags",
      onAction: () => console.log("Add tags:", selectedResources),
    },
    {
      content: "Remove tags",
      onAction: () => console.log("Remove tags:", selectedResources),
    },
    {
      content: "Delete",
      destructive: true,
      onAction: () => console.log("Delete:", selectedResources),
    },
  ];

  // Responsive
  const { smDown } = useBreakpoints();

  // Row markup
  const rowMarkup = products.map(({ id, title, status, inventory, price, image }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <InlineStack gap="300" blockAlign="center">
          <Thumbnail source={image || ""} alt={title} size="small" />
          <Text variant="bodyMd" fontWeight="bold" as="span">{title}</Text>
        </InlineStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={status === "active" ? "success" : status === "draft" ? "info" : undefined}>
          {status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" numeric>{inventory} in stock</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="end" numeric>{price}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Products"
      primaryAction={{ content: "Add product", onAction: () => navigate("/app/products/new") }}
      secondaryActions={[{ content: "Export" }, { content: "Import" }]}
    >
      <Card padding="0">
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          onSort={setSortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search products"
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
          mode={mode}
          setMode={setMode}
          canCreateNewView
          onCreateNewView={async (name) => {
            // Save view logic
            return true;
          }}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={products.length}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Product" },
            { title: "Status" },
            { title: "Inventory" },
            { title: "Price", alignment: "end" },
          ]}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
          sortable={[true, false, true, true]}
          sortDirection="ascending"
          sortColumnIndex={0}
          onSort={(index, direction) => {
            console.log("Sort:", index, direction);
          }}
          condensed={smDown}
          pagination={{
            hasNext: true,
            hasPrevious: false,
            onNext: () => {},
            onPrevious: () => {},
          }}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
```

---

## 4. IndexTable (Complete)

### Props Reference
```typescript
interface IndexTableProps {
  // Required
  headings: IndexTableHeading[];
  itemCount: number;
  selectedItemsCount: number | "All";
  onSelectionChange: (selectionType, toggleType, selection) => void;
  children: React.ReactNode; // IndexTable.Row elements

  // Sorting
  sortable?: boolean[];                     // per-column sortability
  sortDirection?: "ascending" | "descending";
  sortColumnIndex?: number;
  defaultSortDirection?: "ascending" | "descending";
  onSort?: (headingIndex: number, direction: string) => void;

  // Actions
  promotedBulkActions?: BulkAction[];       // primary bulk actions
  bulkActions?: BulkAction[];               // secondary bulk actions

  // Display
  resourceName?: { singular: string; plural: string };
  loading?: boolean;
  emptyState?: React.ReactNode;
  condensed?: boolean;                      // mobile-friendly condensed view
  lastColumnSticky?: boolean;               // stick last column on scroll
  selectable?: boolean;                     // enable/disable selection (default: true)
  hasMoreItems?: boolean;                   // show "select all" prompt

  // Pagination
  pagination?: PaginationProps;
}
```

### IndexTable.Row
```typescript
interface IndexTableRowProps {
  id: string;
  selected: boolean | "indeterminate";
  position: number;

  // Optional
  disabled?: boolean;
  tone?: "subdued" | "success" | "warning" | "critical";
  rowType?: "data" | "subheader" | "child";
  selectionRange?: [number, number];
  onClick?: () => void;
  onNavigation?: (id: string) => void;
}
```

### Row with Link Navigation
```jsx
<IndexTable.Row
  id={id}
  selected={selectedResources.includes(id)}
  position={index}
  onClick={() => navigate(`/app/products/${id}`)}
>
  <IndexTable.Cell>
    <Text variant="bodyMd" fontWeight="bold">{title}</Text>
  </IndexTable.Cell>
</IndexTable.Row>
```

### Subheader Rows (Grouping)
```jsx
<IndexTable.Row
  rowType="subheader"
  id="group-pending"
  position={0}
  selectionRange={[1, 5]}
>
  <IndexTable.Cell as="th" scope="colgroup" colSpan={4}>
    <Text as="span" fontWeight="semibold">Pending Orders (5)</Text>
  </IndexTable.Cell>
</IndexTable.Row>
{/* child rows follow */}
<IndexTable.Row
  rowType="child"
  id="order-1"
  position={1}
  selected={selectedResources.includes("order-1")}
>
  {/* cells */}
</IndexTable.Row>
```

### Row Tones (Status Colors)
```jsx
// Highlight rows by status
<IndexTable.Row tone="success" ...>  {/* Green background */}
<IndexTable.Row tone="warning" ...>  {/* Yellow background */}
<IndexTable.Row tone="critical" ...> {/* Red background */}
<IndexTable.Row tone="subdued" ...>  {/* Grey background */}
```

---

## 5. IndexFilters (Complete)

### Props Reference
```typescript
interface IndexFiltersProps {
  // Sort
  sortOptions?: SortButtonChoice[];
  sortSelected?: string[];
  onSort?: (value: string[]) => void;

  // Query
  queryValue?: string;
  queryPlaceholder?: string;
  onQueryChange?: (value: string) => void;
  onQueryClear?: () => void;

  // Filters
  filters?: FilterInterface[];
  appliedFilters?: AppliedFilterInterface[];
  onClearAll?: () => void;

  // Tabs / Saved Views
  tabs: TabProps[];
  selected: number;
  onSelect: (index: number) => void;
  canCreateNewView?: boolean;
  onCreateNewView?: (name: string) => Promise<boolean>;

  // Mode
  mode: IndexFiltersMode;
  setMode: (mode: IndexFiltersMode) => void;

  // Actions
  primaryAction?: IndexFiltersPrimaryAction;
  cancelAction?: IndexFiltersCancelAction;

  // Options
  disabled?: boolean;
  disableQueryField?: boolean;
  autoFocusSearchField?: boolean;
  showEditColumnsButton?: boolean;
}
```

### Filter Types Examples

#### ChoiceList Filter
```jsx
{
  key: "status",
  label: "Status",
  filter: (
    <ChoiceList
      title="Status"
      titleHidden
      choices={[
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ]}
      selected={statusFilter || []}
      onChange={setStatusFilter}
      allowMultiple
    />
  ),
  shortcut: true,
  pinned: true,
}
```

#### RangeSlider Filter
```jsx
{
  key: "price",
  label: "Price",
  filter: (
    <RangeSlider
      label="Price range"
      labelHidden
      value={priceRange || [0, 500]}
      min={0}
      max={500}
      step={10}
      prefix="$"
      output
      onChange={setPriceRange}
    />
  ),
}
```

#### TextField Filter
```jsx
{
  key: "vendor",
  label: "Vendor",
  filter: (
    <TextField
      label="Vendor"
      labelHidden
      value={vendorFilter}
      onChange={setVendorFilter}
      autoComplete="off"
      placeholder="Search vendors"
    />
  ),
}
```

#### DatePicker Filter
```jsx
{
  key: "date",
  label: "Date",
  filter: (
    <DatePicker
      month={month}
      year={year}
      onChange={setSelectedDate}
      onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
      selected={selectedDate}
    />
  ),
}
```

### Saved Views (Tabs) with CRUD
```jsx
const [tabs, setTabs] = useState([
  { id: "all", content: "All", isLocked: true },
  { id: "active", content: "Active", actions: [
    { type: "rename", onPrimaryAction: async (name) => { /* rename */ return true; }},
    { type: "duplicate", onPrimaryAction: async (name) => { /* duplicate */ return true; }},
    { type: "delete", onPrimaryAction: async () => { /* delete */ return true; }},
    { type: "edit", onAction: () => { /* edit filters */ }},
  ]},
]);

<IndexFilters
  tabs={tabs}
  selected={selectedTab}
  onSelect={setSelectedTab}
  canCreateNewView
  onCreateNewView={async (name) => {
    setTabs([...tabs, {
      id: name.toLowerCase().replace(/\s/g, "-"),
      content: name,
      actions: [
        { type: "rename", onPrimaryAction: async (n) => true },
        { type: "duplicate", onPrimaryAction: async (n) => true },
        { type: "delete", onPrimaryAction: async () => true },
      ],
    }]);
    return true;
  }}
  // ...other props
/>
```

### useSetIndexFiltersMode Hook
```jsx
import { useSetIndexFiltersMode, IndexFiltersMode } from "@shopify/polaris";

const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);
// IndexFiltersMode.Default — normal view
// IndexFiltersMode.Filtering — filter panel open
// IndexFiltersMode.EditingColumns — column editor open
```

---

## 6. Bulk Actions

### Promoted vs Regular Actions
```jsx
// Promoted = visible as buttons, Regular = in "..." menu
const promotedBulkActions = [
  {
    content: "Set as active",
    onAction: () => handleBulkAction("activate", selectedResources),
  },
  {
    content: "Set as draft",
    onAction: () => handleBulkAction("draft", selectedResources),
  },
];

const bulkActions = [
  {
    content: "Add tags",
    onAction: () => handleBulkAction("addTags", selectedResources),
  },
  {
    content: "Remove tags",
    onAction: () => handleBulkAction("removeTags", selectedResources),
  },
  {
    icon: DeleteIcon,
    content: "Delete products",
    destructive: true,
    onAction: () => handleBulkAction("delete", selectedResources),
  },
];
```

### useIndexResourceState Hook
```jsx
import { useIndexResourceState } from "@shopify/polaris";

const {
  selectedResources,      // string[] of selected IDs
  allResourcesSelected,   // boolean
  handleSelectionChange,  // selection handler for IndexTable
  clearSelection,         // clear all selections
  removeSelectedResources, // remove specific items from selection
} = useIndexResourceState(items, {
  resourceIDResolver: (item) => item.id,  // custom ID resolver
  // selectedResources: ["1", "2"],       // controlled mode
});
```

---

## 7. ResourceList

### When to Use ResourceList vs IndexTable
- **IndexTable**: For structured, tabular data with columns (products, orders)
- **ResourceList**: For less structured items with rich media (blog posts, apps)

### Basic ResourceList
```jsx
import { ResourceList, ResourceItem, Avatar, Text, InlineStack } from "@shopify/polaris";

function CustomerList() {
  return (
    <Card>
      <ResourceList
        resourceName={{ singular: "customer", plural: "customers" }}
        items={customers}
        renderItem={(customer) => {
          const { id, name, email, location } = customer;
          const media = <Avatar customer size="md" name={name} />;

          return (
            <ResourceItem
              id={id}
              media={media}
              accessibilityLabel={`View details for ${name}`}
              onClick={() => navigate(`/app/customers/${id}`)}
            >
              <Text variant="bodyMd" fontWeight="bold">{name}</Text>
              <div>{email}</div>
              <div>{location}</div>
            </ResourceItem>
          );
        }}
        sortValue={sortValue}
        sortOptions={[
          { label: "Newest", value: "DATE_MODIFIED_DESC" },
          { label: "Oldest", value: "DATE_MODIFIED_ASC" },
        ]}
        onSortChange={setSortValue}
        filterControl={filterControl}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        promotedBulkActions={[
          { content: "Email customers", onAction: () => {} },
        ]}
        bulkActions={[
          { content: "Add tags", onAction: () => {} },
          { content: "Export", onAction: () => {} },
        ]}
        loading={isLoading}
        totalItemsCount={totalCount}
        hasMoreItems
      />
    </Card>
  );
}
```

---

## 8. Resource Details Layout

### Complete Product Detail Page
```jsx
import {
  Page, InlineGrid, BlockStack, Card, Text, TextField, Select,
  DropZone, Thumbnail, Badge, Divider, Box, InlineStack, Button,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

function ProductDetail() {
  const [title, setTitle] = useState("Product Title");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [productType, setProductType] = useState("");
  const [vendor, setVendor] = useState("");
  const [tags, setTags] = useState("");

  return (
    <Page
      title={title}
      backAction={{ content: "Products", onAction: () => navigate("/app/products") }}
      titleMetadata={<Badge tone="success">Active</Badge>}
      primaryAction={{ content: "Save", onAction: handleSave }}
      secondaryActions={[
        { content: "Duplicate", onAction: handleDuplicate },
        { content: "Preview", onAction: handlePreview },
      ]}
      actionGroups={[
        {
          title: "More actions",
          actions: [
            { content: "Archive", onAction: handleArchive },
            { content: "Delete", destructive: true, onAction: handleDelete },
          ],
        },
      ]}
    >
      <InlineGrid columns={{ xs: 1, md: ["twoThirds", "oneThird"] }} gap="400">
        {/* Primary Column */}
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <TextField
                label="Title"
                value={title}
                onChange={setTitle}
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={description}
                onChange={setDescription}
                multiline={4}
                autoComplete="off"
              />
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Media</Text>
              <DropZone onDrop={handleDrop}>
                <DropZone.FileUpload actionHint="Accepts .jpg, .png, .gif" />
              </DropZone>
              <InlineStack gap="300">
                {images.map((img) => (
                  <Thumbnail key={img.id} source={img.url} alt={img.alt} size="large" />
                ))}
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Pricing</Text>
              <InlineGrid columns={2} gap="400">
                <TextField label="Price" value={price} onChange={setPrice} prefix="$" type="number" autoComplete="off" />
                <TextField label="Compare at price" value={comparePrice} onChange={setComparePrice} prefix="$" type="number" autoComplete="off" />
              </InlineGrid>
            </BlockStack>
          </Card>
        </BlockStack>

        {/* Secondary Column */}
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Status</Text>
              <Select
                label="Status"
                labelHidden
                options={[
                  { label: "Active", value: "active" },
                  { label: "Draft", value: "draft" },
                  { label: "Archived", value: "archived" },
                ]}
                value={status}
                onChange={setStatus}
              />
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Organization</Text>
              <TextField label="Product type" value={productType} onChange={setProductType} autoComplete="off" />
              <TextField label="Vendor" value={vendor} onChange={setVendor} autoComplete="off" />
              <TextField label="Tags" value={tags} onChange={setTags} autoComplete="off" helpText="Separate with commas" />
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
```

---

## 9. App Settings Layout

### Two-Column Settings Pattern
```jsx
import { Page, InlineGrid, BlockStack, Card, Box, Text, TextField, Checkbox, Select, Divider, Button } from "@shopify/polaris";

function SettingsPage() {
  return (
    <Page title="Settings" narrowWidth>
      <BlockStack gap="800">
        {/* Section 1: General */}
        <InlineGrid columns={{ xs: 1, md: ["oneThird", "twoThirds"] }} gap="400">
          <Box>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">General</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Configure basic app settings.
              </Text>
            </BlockStack>
          </Box>
          <Card>
            <BlockStack gap="400">
              <TextField label="App name" value={name} onChange={setName} autoComplete="off" />
              <TextField label="Support email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Select
                label="Language"
                options={[
                  { label: "English", value: "en" },
                  { label: "French", value: "fr" },
                ]}
                value={language}
                onChange={setLanguage}
              />
            </BlockStack>
          </Card>
        </InlineGrid>

        <Divider />

        {/* Section 2: Notifications */}
        <InlineGrid columns={{ xs: 1, md: ["oneThird", "twoThirds"] }} gap="400">
          <Box>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Notifications</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Manage how you receive notifications.
              </Text>
            </BlockStack>
          </Box>
          <Card>
            <BlockStack gap="400">
              <Checkbox
                label="Email notifications"
                checked={emailNotifs}
                onChange={setEmailNotifs}
              />
              <Checkbox
                label="Push notifications"
                checked={pushNotifs}
                onChange={setPushNotifs}
              />
              <Checkbox
                label="Weekly digest"
                checked={weeklyDigest}
                onChange={setWeeklyDigest}
              />
            </BlockStack>
          </Card>
        </InlineGrid>

        <Divider />

        {/* Section 3: Danger Zone */}
        <InlineGrid columns={{ xs: 1, md: ["oneThird", "twoThirds"] }} gap="400">
          <Box>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Danger zone</Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Irreversible actions for your account.
              </Text>
            </BlockStack>
          </Box>
          <Card>
            <BlockStack gap="400">
              <Text as="p">Once you delete your data, there is no going back.</Text>
              <Button tone="critical">Delete all data</Button>
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
```

### CRITICAL Settings Layout Rules:
- Use `narrowWidth` on Page for settings
- Left column: label + description ONLY
- Right column: Card with actual settings
- Use `Divider` between sections
- Stack sections vertically with `gap="800"`
- Don't include description unless it adds value

---

## 10. Complex Forms

### FormLayout with Groups
```jsx
import { FormLayout, TextField, Select, Checkbox } from "@shopify/polaris";

<FormLayout>
  <TextField label="Full name" autoComplete="name" />

  {/* Horizontal group */}
  <FormLayout.Group>
    <TextField label="City" autoComplete="address-level2" />
    <TextField label="State" autoComplete="address-level1" />
    <TextField label="Zip" autoComplete="postal-code" />
  </FormLayout.Group>

  {/* Condensed group (tighter spacing) */}
  <FormLayout.Group condensed>
    <TextField label="Price" prefix="$" type="number" autoComplete="off" />
    <TextField label="Compare at" prefix="$" type="number" autoComplete="off" />
    <TextField label="Cost" prefix="$" type="number" autoComplete="off" />
  </FormLayout.Group>

  <Select label="Country" options={countries} />
  <Checkbox label="Charge tax" />
</FormLayout>
```

### Dynamic Repeatable Fields
```jsx
function VariantFields() {
  const [variants, setVariants] = useState([{ name: "", price: "" }]);

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "" }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd">Variants</Text>
          <Button onClick={addVariant}>Add variant</Button>
        </InlineStack>

        {variants.map((variant, index) => (
          <Card key={index} background="bg-surface-secondary">
            <InlineStack align="space-between" blockAlign="start">
              <InlineGrid columns={2} gap="300" style={{ flex: 1 }}>
                <TextField
                  label="Variant name"
                  value={variant.name}
                  onChange={(val) => updateVariant(index, "name", val)}
                  autoComplete="off"
                />
                <TextField
                  label="Price"
                  value={variant.price}
                  onChange={(val) => updateVariant(index, "price", val)}
                  prefix="$"
                  type="number"
                  autoComplete="off"
                />
              </InlineGrid>
              {variants.length > 1 && (
                <Button
                  icon={DeleteIcon}
                  tone="critical"
                  variant="plain"
                  onClick={() => removeVariant(index)}
                  accessibilityLabel="Remove variant"
                />
              )}
            </InlineStack>
          </Card>
        ))}
      </BlockStack>
    </Card>
  );
}
```

### Form with SaveBar Integration
```jsx
function EditForm() {
  const shopify = useAppBridge();
  const [isDirty, setIsDirty] = useState(false);
  const [formState, setFormState] = useState(initialState);

  const handleChange = (field) => (value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await saveData(formState);
      setIsDirty(false);
      shopify.toast.show("Settings saved");
    } catch (err) {
      shopify.toast.show("Failed to save", { isError: true });
    }
  };

  const handleDiscard = () => {
    setFormState(initialState);
    setIsDirty(false);
  };

  return (
    <Page title="Edit Product">
      <form data-save-bar data-discard-confirmation>
        <Card>
          <FormLayout>
            <TextField
              label="Title"
              value={formState.title}
              onChange={handleChange("title")}
              autoComplete="off"
            />
            <TextField
              label="Description"
              value={formState.description}
              onChange={handleChange("description")}
              multiline={4}
              autoComplete="off"
            />
          </FormLayout>
        </Card>
      </form>
    </Page>
  );
}
```

### Inline Validation
```jsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  autoComplete="email"
  error={emailError}  // string shows as inline error below field
  helpText="We'll use this for billing"
/>

{/* Manual inline error */}
<InlineError message="Store name is required" fieldID="storeName" />
```

---

## 11. Empty States

### Resource Empty State
```jsx
import { EmptyState, Card } from "@shopify/polaris";

<Card>
  <EmptyState
    heading="Manage your products"
    action={{ content: "Add product", onAction: handleCreate }}
    secondaryAction={{ content: "Learn more", url: "https://help.shopify.com" }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Track and manage your product catalog.</p>
  </EmptyState>
</Card>
```

### Empty Search/Filter State
```jsx
// When filters return no results — DON'T show full EmptyState
// Instead use a simpler message
<IndexTable
  emptyState={
    <EmptySearchResult
      title="No products found"
      description="Try changing the filters or search term"
      withIllustration
    />
  }
  // ...
/>
```

---

## 12. Loading & Skeleton Patterns

### Skeleton Page (Initial Load)
```jsx
import { SkeletonPage, Layout, Card, SkeletonBodyText, SkeletonDisplayText, BlockStack } from "@shopify/polaris";

function ProductsLoading() {
  return (
    <SkeletonPage primaryAction title="">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={5} />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
```

### Skeleton Tabs
```jsx
import { Card, SkeletonTabs } from "@shopify/polaris";

<Card>
  <SkeletonTabs count={4} />
  <SkeletonBodyText lines={6} />
</Card>
```

### Loading State for IndexTable
```jsx
<IndexTable
  loading={isLoading}
  // ... other props
>
  {rowMarkup}
</IndexTable>
```

### Spinner
```jsx
import { Spinner, InlineStack, Box } from "@shopify/polaris";

// Inline spinner
<InlineStack align="center">
  <Spinner size="small" />
  <Text>Loading...</Text>
</InlineStack>

// Full page spinner
<Box padding="800" width="100%">
  <InlineStack align="center">
    <Spinner accessibilityLabel="Loading products" size="large" />
  </InlineStack>
</Box>
```

---

## 13. Error Handling UI

### Banner Errors
```jsx
import { Banner, Page, BlockStack } from "@shopify/polaris";

<Page title="Products">
  <BlockStack gap="400">
    {error && (
      <Banner
        title="There was an error loading products"
        tone="critical"
        onDismiss={() => setError(null)}
      >
        <p>{error.message}</p>
        <Button onClick={retry}>Try again</Button>
      </Banner>
    )}
    {/* content */}
  </BlockStack>
</Page>
```

### Form Validation Errors
```jsx
// Show banner at top of form with all errors
{formErrors.length > 0 && (
  <Banner title="There are errors with your submission" tone="critical">
    <List>
      {formErrors.map((err, i) => (
        <List.Item key={i}>{err}</List.Item>
      ))}
    </List>
  </Banner>
)}
```

### Inline Field Errors
```jsx
<TextField
  label="Title"
  value={title}
  onChange={setTitle}
  error={!title ? "Title is required" : undefined}
  autoComplete="off"
/>
```

---

## 14. Banner & Feedback

### Banner Tones
```jsx
// Info (blue)
<Banner title="App update available" tone="info">
  <p>Version 2.0 is available with new features.</p>
</Banner>

// Success (green)
<Banner title="Order fulfilled" tone="success" onDismiss={dismiss}>
  <p>Order #1234 has been fulfilled.</p>
</Banner>

// Warning (yellow)
<Banner title="Rate limit approaching" tone="warning">
  <p>You've used 80% of your API quota.</p>
</Banner>

// Critical (red)
<Banner title="Payment failed" tone="critical">
  <p>The payment for order #5678 was declined.</p>
</Banner>
```

### Banner with Actions
```jsx
<Banner
  title="Your trial ends in 3 days"
  tone="warning"
  action={{ content: "Upgrade now", onAction: handleUpgrade }}
  secondaryAction={{ content: "Learn more", url: "/app/pricing" }}
  onDismiss={dismiss}
>
  <p>Upgrade to continue using all features.</p>
</Banner>
```

---

## 15. Navigation & Tabs

### Tabs Component
```jsx
import { Tabs, Card } from "@shopify/polaris";

function ContentTabs() {
  const [selected, setSelected] = useState(0);

  const tabs = [
    { id: "overview", content: "Overview", panelID: "overview-panel" },
    { id: "analytics", content: "Analytics", panelID: "analytics-panel" },
    { id: "settings", content: "Settings", panelID: "settings-panel" },
  ];

  return (
    <Card>
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
        <Card.Section>
          {selected === 0 && <OverviewContent />}
          {selected === 1 && <AnalyticsContent />}
          {selected === 2 && <SettingsContent />}
        </Card.Section>
      </Tabs>
    </Card>
  );
}
```

### Pagination
```jsx
import { Pagination } from "@shopify/polaris";

<Pagination
  hasPrevious={page > 1}
  hasNext={hasNextPage}
  onPrevious={() => setPage(page - 1)}
  onNext={() => setPage(page + 1)}
  label={`Page ${page} of ${totalPages}`}
/>
```

---

## 16. Popover & ActionList

### Popover with Actions
```jsx
import { Popover, ActionList, Button } from "@shopify/polaris";

function ActionsMenu() {
  const [active, setActive] = useState(false);

  return (
    <Popover
      active={active}
      activator={
        <Button onClick={() => setActive(!active)} disclosure>
          More actions
        </Button>
      }
      onClose={() => setActive(false)}
    >
      <ActionList
        actionRole="menuitem"
        items={[
          { content: "Import", onAction: handleImport },
          { content: "Export", onAction: handleExport },
        ]}
        sections={[
          {
            title: "Danger zone",
            items: [
              {
                content: "Delete",
                destructive: true,
                onAction: handleDelete,
              },
            ],
          },
        ]}
      />
    </Popover>
  );
}
```

---

## 17. Card Patterns

### Basic Card
```jsx
<Card>
  <BlockStack gap="400">
    <Text as="h2" variant="headingMd">Title</Text>
    <Text as="p">Content goes here</Text>
  </BlockStack>
</Card>
```

### Card with Header Actions
```jsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text as="h2" variant="headingMd">Recent orders</Text>
      <Button variant="plain" onClick={viewAll}>View all</Button>
    </InlineStack>
    {/* content */}
  </BlockStack>
</Card>
```

### Card with Subdued Background
```jsx
<Card background="bg-surface-secondary">
  <BlockStack gap="200">
    <Text as="h3" variant="headingSm">Summary</Text>
    <Text as="p" tone="subdued">3 items selected</Text>
  </BlockStack>
</Card>
```

### Card with No Padding (for tables)
```jsx
<Card padding="0">
  <IndexTable>{/* ... */}</IndexTable>
</Card>
```

---

## 18. Badge & Status

### Badge Tones
```jsx
<Badge tone="success">Active</Badge>     {/* Green */}
<Badge tone="info">Draft</Badge>          {/* Blue */}
<Badge tone="warning">Pending</Badge>     {/* Yellow */}
<Badge tone="critical">Error</Badge>      {/* Red */}
<Badge tone="attention">Action needed</Badge>  {/* Orange */}
<Badge>Default</Badge>                    {/* Grey */}

{/* With progress */}
<Badge progress="complete" tone="success">Fulfilled</Badge>
<Badge progress="partiallyComplete" tone="warning">Partially fulfilled</Badge>
<Badge progress="incomplete">Unfulfilled</Badge>
```

### Status Pattern
```jsx
function StatusBadge({ status }) {
  const map = {
    active:    { tone: "success", label: "Active" },
    draft:     { tone: "info", label: "Draft" },
    archived:  { tone: undefined, label: "Archived" },
    pending:   { tone: "warning", label: "Pending" },
    error:     { tone: "critical", label: "Error" },
  };
  const { tone, label } = map[status] || { tone: undefined, label: status };
  return <Badge tone={tone}>{label}</Badge>;
}
```

---

## 19. Responsive Patterns

### useBreakpoints Hook
```jsx
import { useBreakpoints } from "@shopify/polaris";

function ResponsiveLayout() {
  const { smDown, mdDown, lgUp } = useBreakpoints();

  return (
    <InlineGrid
      columns={smDown ? 1 : mdDown ? 2 : 3}
      gap="400"
    >
      {items.map((item) => (
        <Card key={item.id}>{/* ... */}</Card>
      ))}
    </InlineGrid>
  );
}
```

### Condensed IndexTable on Mobile
```jsx
const { smDown } = useBreakpoints();

<IndexTable
  condensed={smDown}
  // ...
/>
```

### Responsive InlineGrid
```jsx
// Auto-responsive columns
<InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
  {/* items */}
</InlineGrid>

// Named columns
<InlineGrid columns={{ xs: 1, md: ["twoThirds", "oneThird"] }} gap="400">
  <div>Main</div>
  <div>Sidebar</div>
</InlineGrid>
```

---

## 20. Component Reference

### Layout Components
| Component | Purpose |
|-----------|---------|
| `Page` | Outer page wrapper with title & actions |
| `Layout` | Two-column layout (main + sidebar) |
| `InlineGrid` | CSS Grid-based responsive columns |
| `BlockStack` | Vertical flex layout with gap |
| `InlineStack` | Horizontal flex layout with gap |
| `Card` | Content container with padding |
| `Box` | Primitive layout access to tokens |
| `Bleed` | Negative margin extension |
| `Divider` | Visual separator |

### Data Display Components
| Component | Purpose |
|-----------|---------|
| `IndexTable` | Sortable, selectable data table |
| `DataTable` | Simple data display (no selection) |
| `ResourceList` | Rich media item list |
| `DescriptionList` | Term/definition pairs |

### Form Components
| Component | Purpose |
|-----------|---------|
| `TextField` | Text input |
| `Select` | Dropdown selection |
| `Checkbox` | Multi-select option |
| `RadioButton` | Single-select option |
| `ChoiceList` | Grouped checkboxes/radios |
| `RangeSlider` | Numeric range input |
| `DatePicker` | Calendar date picker |
| `DropZone` | File upload area |
| `ColorPicker` | Color selection |
| `Autocomplete` | Searchable input with suggestions |
| `Combobox` | Accessible autocomplete |
| `Tag` | Removable label/keyword |
| `FormLayout` | Form field arrangement |

### Feedback Components
| Component | Purpose |
|-----------|---------|
| `Banner` | Prominent status messages |
| `Badge` | Inline status indicators |
| `Spinner` | Loading indicator |
| `ProgressBar` | Task completion |
| `EmptyState` | No-data placeholder |
| `SkeletonPage` | Page loading placeholder |
| `SkeletonBodyText` | Text loading placeholder |
| `SkeletonDisplayText` | Heading loading placeholder |

### Overlay Components
| Component | Purpose |
|-----------|---------|
| `Popover` | On-demand overlay |
| `Tooltip` | Hover explanation |
| `ActionList` | List of actions in popover |

---

## 21. Constraints & Rules

### ALWAYS:
- Wrap everything in `<AppProvider i18n={...}>`
- Use `Page` as the outermost component for every route
- Use `Card` to group related content
- Use `BlockStack` with `gap` tokens for vertical spacing (never manual margin)
- Use `InlineGrid` for responsive columns (not CSS Grid/Flexbox)
- Use `useBreakpoints()` for responsive logic
- Use `useIndexResourceState()` with IndexTable
- Use `useSetIndexFiltersMode()` with IndexFilters
- Set `autoComplete` prop on every `TextField`
- Use `resourceName` prop on IndexTable and ResourceList
- Place primary action in Page top-right
- Use `EmptyState` when resource index has zero items
- Use `SkeletonPage` during initial page load
- Use `condensed` mode on IndexTable for mobile
- Limit promoted filters to 2-3 max
- Use `data-save-bar` attribute for form dirty state detection

### NEVER:
- Use raw HTML elements when a Polaris component exists
- Use `style` prop for layout — use layout components instead
- Use CSS margin/padding — use `Box` padding or `BlockStack`/`InlineStack` gap
- Nest `AppProvider` (except in modal iframes)
- Use `ResourceList` when `IndexTable` is more appropriate for tabular data
- Create custom filter UIs — use `IndexFilters` component
- Skip loading states — always show skeleton or spinner
- Use `fullWidth` on Page for detail/settings pages (only for index tables)
- Hard-code breakpoint values — use `useBreakpoints()`
