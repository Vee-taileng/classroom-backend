import { and, eq, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { subjects, department } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Get all subjects with options, search, pagination, and sorting
router.get("/", async (req, res) => {
  try {
    // Extract query parameters for search, department filter, pagination, and sorting
    const { search, departments, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, +page);
    const pageLimit = Math.max(1, +limit);

    const offset = (currentPage - 1) * pageLimit;

    const filterConditions = [];

    // If search query exists, filter by name or code

    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    // If department filter exists, filter by department name
    if (departments) {
      filterConditions.push(ilike(department.name, `%${department}%`));
    }

    // Combine filters using And if there are any
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count total subjects matching the filters
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(department, eq(subjects.department_id, department.id))
      .where(whereClause);

      const total = countResult[0]?.count || 0;
  } catch (error) {
    console.error(`Get /subjects error:`, error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});
