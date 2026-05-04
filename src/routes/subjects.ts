import express from "express";
import { or, ilike, and, sql, eq, getTableColumns } from "drizzle-orm";
import { department, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, deppartment, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    // If search query exists, filter by subject name or subject code
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    // If department query exists, filter by department name
    if (deppartment) {
      filterConditions.push(
        ilike(department.name, `%${deppartment}%`)
      );
    }

    // Combine all filter conditions using AND
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)`})
      .from(subjects)
      .leftJoin(department, eq(subjects.department_id, department.id))
      .where(whereClause);

      const totalCount = countResult[0]?.count ?? 0;

      const subjectList = await db
      .select({
        ...getTableColumns(subjects), 
        department: {...getTableColumns(department) }
      })
      .from(subjects)
      .leftJoin(department, eq(subjects.department_id, department.id))
      .where(whereClause)
      .limit(limitPerPage)
      .offset(offset);

    res.json({
      data: subjectList,
      pagination: {
        currentPage,
        limitPerPage,
        totalCount,
        totalPage: Math.ceil(totalCount / limitPerPage)
      }
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching subjects." });
  }
});

export default router;
