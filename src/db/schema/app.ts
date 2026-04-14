import { desc, relations } from "drizzle-orm";
import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  update_at: timestamp("update_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const department = pgTable("department", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 25 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  department_id: integer("department_id")
    .notNull()
    .references(() => department.id, { onDelete: "restrict" }),
  code: varchar("code", { length: 25 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

export const departmentRelations = relations(department, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(department, {
    fields: [subjects.department_id],
    references: [department.id],
  }),
}));

export type Depatment = typeof department.$inferSelect;
export type NewDepartment = typeof department.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;