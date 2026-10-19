namespace ParkingLotSlotAllocator.DataStructures;

/// <summary>
/// A FIFO Queue implementation for handling vehicles waiting at the entrance gate.
/// Demonstrates First-In, First-Out (FIFO) ordering in DSA.
/// </summary>
public class WaitingQueue<T>
{
    private class Node
    {
        public T Data { get; }
        public Node? Next { get; set; }

        public Node(T data)
        {
            Data = data;
        }
    }

    private Node? _head;
    private Node? _tail;
    private int _count;

    public int Count => _count;
    public bool IsEmpty => _count == 0;

    public void Enqueue(T item)
    {
        var node = new Node(item);
        if (_tail != null)
        {
            _tail.Next = node;
        }
        else
        {
            _head = node;
        }
        _tail = node;
        _count++;
    }

    public T Dequeue()
    {
        if (IsEmpty || _head == null)
            throw new InvalidOperationException("Queue is empty.");

        T data = _head.Data;
        _head = _head.Next;
        if (_head == null)
        {
            _tail = null;
        }
        _count--;
        return data;
    }

    public T Peek()
    {
        if (IsEmpty || _head == null)
            throw new InvalidOperationException("Queue is empty.");

        return _head.Data;
    }

    public List<T> ToList()
    {
        var list = new List<T>();
        var curr = _head;
        while (curr != null)
        {
            list.Add(curr.Data);
            curr = curr.Next;
        }
        return list;
    }

    public void Clear()
    {
        _head = null;
        _tail = null;
        _count = 0;
    }
}
