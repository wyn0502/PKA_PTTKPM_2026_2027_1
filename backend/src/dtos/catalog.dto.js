// Dung Pham Anh: CategoryDTO và PublisherDTO cho danh mục thể loại và nhà xuất bản
export const toCategoryDTO = (row) => ({
  categoryId: row.category_id,
  categoryName: row.category_name,
  description: row.description,
  parentId: row.parent_id,
  parentName: row.parent_name,
  titleCount: row.title_count ?? 0,
});

export const toPublisherDTO = (row) => ({
  publisherId: row.publisher_id,
  publisherName: row.publisher_name,
  address: row.address,
  contactEmail: row.contact_email,
  phone: row.phone,
  titleCount: row.title_count ?? 0,
});
