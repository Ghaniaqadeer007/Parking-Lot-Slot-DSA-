namespace ParkingLotSlotAllocator.DataStructures;

/// <summary>
/// A LIFO Stack implementation for tracking allocation/deallocation actions.
/// Demonstrates Last-In, First-Out (LIFO) behavior and enables the Undo functionality in DSA.
/// </summary>
public class TransactionStack<T>
{
    private class Node
    {
        public T Data { get; }
        public Node? Next { get; set; }

        public Node(T data, Node? next)
        {
            Data = data;
            Next = next;
        }
    }

    private Node? _top;
    private int _count;

    public int Count => _count;
    public bool IsEmpty => _count == 0;

    public void Push(T item)
    {
        _top = new Node(item, _top);
        _count++;
    }

    public T Pop()
    {
        if (IsEmpty || _top == null)
            throw new InvalidOperationException("Stack is empty.");

        T data = _top.Data;
        _top = _top.Next;
        _count--;
        return data;
    }

    public T Peek()
    {
        if (IsEmpty || _top == null)
            throw new InvalidOperationException("Stack is empty.");

        return _top.Data;
    }

    public List<T> ToList()
    {
        var list = new List<T>();
        var curr = _top;
        while (curr != null)
        {
            list.Add(curr.Data);
            curr = curr.Next;
        }
        return list;
    }

    public void Clear()
    {
        _top = null;
        _count = 0;
    }
}
