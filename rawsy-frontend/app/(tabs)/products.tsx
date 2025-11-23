import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Appbar, Card, Searchbar, Chip, ActivityIndicator, Badge, IconButton } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function ProductsScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'cotton', 'leather', 'textile', 'chemicals'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <MaterialIcons key={i} name="star" size={14} color="#f59e0b" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <MaterialIcons key={i} name="star-half" size={14} color="#f59e0b" />
        );
      } else {
        stars.push(
          <MaterialIcons key={i} name="star-border" size={14} color="#d1d5db" />
        );
      }
    }
    return stars;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Products" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search products"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryChip}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Loading products...
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory-2" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>
              No products found
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((product: any) => (
              <Card key={product._id} style={[styles.productCard, { width: cardWidth }]}>
                <View style={styles.imageContainer}>
                  <Card.Cover
                    source={{ uri: product.image || product.images?.[0] || 'https://via.placeholder.com/200' }}
                    style={styles.cardImage}
                  />
                  {product.discount?.active && (
                    <Badge style={styles.discountBadge} size={28}>
                      {String(product.discount.percentage) + '%'}
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                </View>

                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" numberOfLines={2} style={styles.productName}>
                    {product.name}
                  </Text>

                  <Text variant="bodySmall" style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
                    {product.category}
                  </Text>

                  {product.rating?.average > 0 && (
                    <View style={styles.ratingRow}>
                      <View style={styles.stars}>
                        {renderStars(product.rating.average)}
                      </View>
                      <Text variant="bodySmall" style={styles.ratingText}>
                        ({product.rating.count})
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    {product.discount?.active ? (
                      <View style={styles.discountPriceContainer}>
                        <Text variant="bodySmall" style={styles.originalPrice}>
                          {product.price} ETB
                        </Text>
                        <Text variant="titleLarge" style={[styles.price, { color: theme.colors.primary }]}>
                          {product.finalPrice.toFixed(2)} ETB
                        </Text>
                      </View>
                    ) : (
                      <Text variant="titleLarge" style={[styles.price, { color: theme.colors.primary }]}>
                        {product.price} ETB
                      </Text>
                    )}
                    <Text variant="bodySmall" style={[styles.unit, { color: theme.colors.onSurfaceVariant }]}>
                      /{product.unit}
                    </Text>
                  </View>

                  {product.stock > 0 ? (
                    <View style={styles.stockRow}>
                      <MaterialIcons name="check-circle" size={14} color="#10b981" />
                      <Text variant="bodySmall" style={styles.inStock}>
                        In Stock: {product.stock}
                      </Text>
                    </View>
                  ) : null}

                  {product.negotiable && (
                    <View style={styles.negotiableBadge}>
                      <MaterialIcons name="handshake" size={12} color={theme.colors.secondary} />
                      <Text variant="bodySmall" style={[styles.negotiableText, { color: theme.colors.secondary }]}>
                        Negotiable
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Showing {filteredProducts.length} of {products.length} products
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 150,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContent: {
    paddingTop: 12,
  },
  productName: {
    fontWeight: '600',
    minHeight: 44,
  },
  category: {
    marginTop: 4,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  discountPriceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    fontSize: 12,
  },
  price: {
    fontWeight: 'bold',
  },
  unit: {
    marginLeft: 4,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  inStock: {
    color: '#10b981',
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  negotiableText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
