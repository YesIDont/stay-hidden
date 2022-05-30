export class HeapTree
{
  constructor()
  {
    this.items = [];
    this.currentItemCount = 0;
  }

  push(item)
  {
    item.heapIndex = this.currentItemCount;
    this.items[this.currentItemCount] = item;
    this._sortUp(item);
    this.currentItemCount++;
  }

  pullOutTheLowest()
  {
    const firstItem = this.items.shift();
    if (this.items.length > 0)
    {
      const last = this.items.pop();
      this.items.unshift(last);
      this.items[0].heapIndex = 0;
      if (this.items.length > 1) this._sortDown(this.items[0]);
    }
    this.currentItemCount -= 1;

    return firstItem;
  }

  hasItem(item)
  {
    return this.items.some(i => i.id === item.id);
  }

  getLength()
  {
    return this.currentItemCount;
  }

  reset()
  {
    this.items = [];
    this.currentItemCount = 0;
  }

  _compareNumbers(A, B)
  {
    if (A < B) return -1;
    if (A === B) return 0;
    return 1;
  }

  _compareItems(A, B)
  {
    let compare = this._compareNumbers(A.fCost, B.fCost);
    if (compare == 0) compare = this._compareNumbers(A.hCost, B.hCost);

    return -compare;
  }

  _getParentIndex(itemIndex)
  {
    let parentIndex = Math.floor((itemIndex - 1) * 0.5);
    if (parentIndex < 0) return 0;

    return parentIndex;
  }

  _sortUp(item)
  {
    let parentIndex = this._getParentIndex(item.heapIndex);

    let shouldKeepSearching = true;
    while(shouldKeepSearching)
    {
      const parentItem = this.items[parentIndex];
      if (parentItem && this._compareItems(item, parentItem) > 0)
      {
        this._swap(item, parentItem);
      }
      else
      {
        shouldKeepSearching = false;
      }
      parentIndex = this._getParentIndex(item.heapIndex);
    }
  }

  _sortDown(item)
  {
    let shouldKeepSearching = true;
    while(shouldKeepSearching)
    {
      const index = item.heapIndex;
      const childLeftIndex = index * 2 + 1;
      const childRightIndex = index * 2 + 2;
      let swapIndex = 0;

      if (childLeftIndex < this.currentItemCount)
      {
        swapIndex = childLeftIndex;

        const left = this.items[childLeftIndex];
        const right = this.items[childRightIndex];
        if (childRightIndex < this.currentItemCount && left && right && this._compareItems(left, right) < 0)
        {
          swapIndex = childRightIndex;
        }

        const potential = this.items[swapIndex];
        if (potential && this._compareItems(item, potential) < 0)
        {
          this._swap(item, potential);
        }
        else
        {
          shouldKeepSearching = false;
        }
      }
      else
      {
        shouldKeepSearching = false;
      }
    }
  }

  _swap(A, B)
  {
    const indexA = A.heapIndex;
    const indexB = B.heapIndex;
    B.heapIndex = indexA;
    A.heapIndex = indexB;
    this.items[indexA] = B;
    this.items[indexB] = A;
  }
}
