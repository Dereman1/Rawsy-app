import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, Card, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ProductsScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Products" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
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
            <ActivityIndicator size="large" />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No products found
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((product: any) => (
              <Card key={product._id} style={styles.productCard}>
                <Card.Cover source={{ uri: product.image || 'https://via.placeholder.com/150' }} />
                <Card.Content style={styles.cardContent}>
                  <Text variant="titleMedium" numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.category}>
                    {product.category}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text variant="titleLarge" style={styles.price}>
                      {product.price} ETB
                    </Text>
                    <Text variant="bodySmall" style={styles.unit}>
                      /{product.unit}
                    </Text>
                  </View>
                  {product.stock > 0 ? (
                    <Text variant="bodySmall" style={styles.inStock}>
                      In Stock: {product.stock}
                    </Text>
                  ) : (
                    <Text variant="bodySmall" style={styles.outOfStock}>
                      Out of Stock
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
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
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  productCard: {
    width: '47%',
    margin: '1.5%',
    marginBottom: 16,
  },
  cardContent: {
    paddingTop: 12,
  },
  category: {
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  unit: {
    color: '#666',
    marginLeft: 4,
  },
  inStock: {
    color: '#10b981',
    marginTop: 4,
  },
  outOfStock: {
    color: '#dc2626',
    marginTop: 4,
  },
});
