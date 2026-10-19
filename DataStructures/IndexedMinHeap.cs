namespace ParkingLotSlotAllocator.DataStructures;

/// <summary>
/// Indexed Min-Heap for 1..100 parking slot management as specified in PRD.md / DESIGN.md.
/// - PopMin: O(log n)
/// - Push: O(log n)
/// - Peek: O(1)
/// - Remove(slot): O(log n) via O(1) position lookup in Dictionary
/// - Contains: O(1)
/// </summary>
public sealed class IndexedMinHeap
{
    private readonly List<int> _a = new();                 // heap array of slot numbers
    private readonly Dictionary<int, int> _pos = new();     // slot -> index in _a

    public int Count => _a.Count;
    public bool IsEmpty => _a.Count == 0;

    public bool Contains(int slot) => _pos.ContainsKey(slot);

    public int Peek()
    {
        if (_a.Count == 0) throw new InvalidOperationException("Heap is empty.");
        return _a[0];
    }

    public void Push(int slot)
    {
        if (_pos.ContainsKey(slot)) return; // already present

        _a.Add(slot);
        int index = _a.Count - 1;
        _pos[slot] = index;
        SiftUp(index);
    }

    public int PopMin()
    {
        if (_a.Count == 0) throw new InvalidOperationException("Heap is empty.");

        int min = _a[0];
        Swap(0, _a.Count - 1);
        _pos.Remove(min);
        _a.RemoveAt(_a.Count - 1);

        if (_a.Count > 0)
        {
            SiftDown(0);
        }

        return min;
    }

    public bool Remove(int slot)
    {
        if (!_pos.TryGetValue(slot, out int i)) return false;

        int last = _a.Count - 1;
        if (i == last)
        {
            _pos.Remove(slot);
            _a.RemoveAt(last);
            return true;
        }

        Swap(i, last);
        _pos.Remove(slot);
        _a.RemoveAt(last);

        // Rebalance at position i
        if (i < _a.Count)
        {
            SiftDown(i);
            SiftUp(i);
        }

        return true;
    }

    public void Clear()
    {
        _a.Clear();
        _pos.Clear();
    }

    public List<int> ToList() => new(_a);

    public IReadOnlyDictionary<int, int> GetPositions() => _pos;

    private void SiftUp(int i)
    {
        while (i > 0)
        {
            int parent = (i - 1) / 2;
            if (_a[i] >= _a[parent]) break;

            Swap(i, parent);
            i = parent;
        }
    }

    private void SiftDown(int i)
    {
        int count = _a.Count;
        while (true)
        {
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            int smallest = i;

            if (left < count && _a[left] < _a[smallest]) smallest = left;
            if (right < count && _a[right] < _a[smallest]) smallest = right;

            if (smallest == i) break;

            Swap(i, smallest);
            i = smallest;
        }
    }

    private void Swap(int i, int j)
    {
        int slotI = _a[i];
        int slotJ = _a[j];

        _a[i] = slotJ;
        _a[j] = slotI;

        _pos[slotJ] = i;
        _pos[slotI] = j;
    }
}
