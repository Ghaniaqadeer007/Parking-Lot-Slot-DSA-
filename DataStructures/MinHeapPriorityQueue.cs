namespace ParkingLotSlotAllocator.DataStructures;

/// <summary>
/// A generic Min-Heap Priority Queue implementation for DSA project.
/// Allows O(log N) insertion, O(log N) extraction of the minimum element, and O(1) peek.
/// In this project, it delivers the nearest available parking slot to the gate immediately.
/// </summary>
public class MinHeapPriorityQueue<T> where T : IComparable<T>
{
    private readonly List<T> _elements = new();

    public int Count => _elements.Count;
    public bool IsEmpty => _elements.Count == 0;

    public void Insert(T item)
    {
        _elements.Add(item);
        HeapifyUp(_elements.Count - 1);
    }

    public T Peek()
    {
        if (IsEmpty) throw new InvalidOperationException("Priority Queue is empty.");
        return _elements[0];
    }

    public T ExtractMin()
    {
        if (IsEmpty) throw new InvalidOperationException("Priority Queue is empty.");

        T min = _elements[0];
        int lastIndex = _elements.Count - 1;
        _elements[0] = _elements[lastIndex];
        _elements.RemoveAt(lastIndex);

        if (_elements.Count > 0)
        {
            HeapifyDown(0);
        }

        return min;
    }

    public bool Remove(T item)
    {
        int index = _elements.IndexOf(item);
        if (index < 0) return false;

        int lastIndex = _elements.Count - 1;
        if (index == lastIndex)
        {
            _elements.RemoveAt(lastIndex);
            return true;
        }

        _elements[index] = _elements[lastIndex];
        _elements.RemoveAt(lastIndex);

        HeapifyDown(index);
        HeapifyUp(index);
        return true;
    }

    public void Clear()
    {
        _elements.Clear();
    }

    public List<T> ToList()
    {
        return new List<T>(_elements);
    }

    private void HeapifyUp(int index)
    {
        while (index > 0)
        {
            int parentIndex = (index - 1) / 2;
            if (_elements[index].CompareTo(_elements[parentIndex]) >= 0)
                break;

            Swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private void HeapifyDown(int index)
    {
        int count = _elements.Count;
        while (true)
        {
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;
            int smallest = index;

            if (leftChild < count && _elements[leftChild].CompareTo(_elements[smallest]) < 0)
            {
                smallest = leftChild;
            }

            if (rightChild < count && _elements[rightChild].CompareTo(_elements[smallest]) < 0)
            {
                smallest = rightChild;
            }

            if (smallest == index)
                break;

            Swap(index, smallest);
            index = smallest;
        }
    }

    private void Swap(int i, int j)
    {
        (_elements[i], _elements[j]) = (_elements[j], _elements[i]);
    }
}
