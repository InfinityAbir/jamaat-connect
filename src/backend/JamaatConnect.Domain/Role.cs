using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace JamaatConnect.Domain.Entities
{
    public class Role : IdentityRole<Guid>
    {
        public string? Description { get; set; }
        public bool IsSystemRole { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();

        protected Role() : base() { }

        public Role(string name, string? description = null, bool isSystemRole = false) : base(name)
        {
            Id = Guid.NewGuid();
            Description = description;
            IsSystemRole = isSystemRole;
            NormalizedName = name.ToUpperInvariant();
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(string name, string? description)
        {
            Name = name;
            NormalizedName = name.ToUpperInvariant();
            Description = description;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}