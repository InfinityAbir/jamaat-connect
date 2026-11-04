using System.Collections.Generic;

namespace JamaatConnect.Domain.Entities
{
    public class Location : BaseEntity
    {
        public string Name { get; private set; }
        public string? StableIdentifier { get; private set; }
        public int Level { get; private set; }
        public Guid? ParentLocationId { get; private set; }
        public bool IsActive { get; private set; }

        // Navigation properties
        public Location? ParentLocation { get; private set; }
        public ICollection<Location> ChildLocations { get; private set; } = new HashSet<Location>();

        protected Location() { }

        public Location(
            string name,
            string? stableIdentifier,
            int level,
            Guid? parentLocationId = null,
            bool isActive = true)
        {
            Name = name;
            StableIdentifier = stableIdentifier;
            Level = level;
            ParentLocationId = parentLocationId;
            IsActive = isActive;
        }

        public void UpdateDetails(
            string name,
            string? stableIdentifier,
            bool isActive)
        {
            Name = name;
            StableIdentifier = stableIdentifier;
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetParent(Guid? parentLocationId)
        {
            ParentLocationId = parentLocationId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}