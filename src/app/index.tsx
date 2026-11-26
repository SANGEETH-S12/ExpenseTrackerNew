
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Expense = {
  id: string;
  title: string;
  amount: string;
  category: string;
};

const categories = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Others',
];

export default function App() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [title, setTitle] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved expenses
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const savedExpenses = await AsyncStorage.getItem('expenses');

        if (savedExpenses !== null) {
          setExpenses(JSON.parse(savedExpenses));
        }
      } catch (error) {
        console.log('Error loading expenses:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadExpenses();
  }, []);

  // Save expenses whenever they change
  useEffect(() => {
    if (!loaded) return;

    const saveExpenses = async () => {
      try {
        await AsyncStorage.setItem(
          'expenses',
          JSON.stringify(expenses)
        );
      } catch (error) {
        console.log('Error saving expenses:', error);
      }
    };

    saveExpenses();
  }, [expenses, loaded]);

  // Calculate total
  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const expenseCount = expenses.length;

  const averageExpense =
    expenseCount > 0 ? total / expenseCount : 0;

  // Search and filter expenses
  const filteredExpenses = expenses.filter((item) => {
    const matchesCategory =
      selectedFilter === 'All' ||
      item.category === selectedFilter;

    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Add expense
  const addExpense = () => {
    if (!title.trim()) {
      Alert.alert('Invalid Expense', 'Please enter an expense name');
      return;
    }

    const numericAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: numericAmount.toString(),
      category: category,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    setTitle('');
    setAmount('');
  };

  // Delete expense
  const deleteExpense = (id: string) => {
    setExpenses((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Expense Tracker</Text>
      <Text style={styles.subtitle}>
        Manage your daily expenses
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Expenses</Text>

        <Text style={styles.cardInfo}>
          Total Transactions: {expenseCount}
        </Text>

        <Text style={styles.cardInfo}>
          Average Expense: ₹{averageExpense.toFixed(2)}
        </Text>

        <Text style={styles.total}>
          ₹{total.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Add New Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Expense name"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (₹)"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.sectionTitle}>Select Category</Text>

      <View style={styles.categoryContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.selectedCategory,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryText,
                category === item && styles.selectedCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={addExpense}
      >
        <Text style={styles.buttonText}>+ Add Expense</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      <TextInput
        style={styles.input}
        placeholder="Search expenses..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.categoryContainer}>
        {['All', ...categories].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              selectedFilter === item && styles.selectedCategory,
            ]}
            onPress={() => setSelectedFilter(item)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedFilter === item &&
                  styles.selectedCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>
            No expenses added yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseName}>
                {item.title}
              </Text>
              <Text style={styles.categoryText}>
                {item.category}
              </Text>
            </View>

            <Text style={styles.expenseAmount}>
              ₹{item.amount}
            </Text>

            <TouchableOpacity
              onPress={() => deleteExpense(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    padding: 20,
    paddingTop: 45,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  subtitle: {
    color: '#777',
    marginTop: 5,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#6D28D9',
    padding: 25,
    borderRadius: 18,
    marginBottom: 25,
  },
  cardLabel: {
    color: '#E9D5FF',
    fontSize: 16,
  },
  cardInfo: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  total: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6D28D9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedCategory: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  categoryText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
});
