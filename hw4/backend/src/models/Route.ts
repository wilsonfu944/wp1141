// 路線模型
import { db } from '../database/connection';
import { Route, CreateRouteRequest, UpdateRouteRequest } from '../types';

export class RouteModel {
  // 根據 ID 查找路線
  static async findById(id: number): Promise<Route | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM routes WHERE id = ?';
      db.get(sql, [id], (err, row: Route) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 根據使用者 ID 查找所有路線
  static async findByUserId(userId: number): Promise<Route[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM routes WHERE createdBy = ? ORDER BY createdAt DESC';
      db.all(sql, [userId], (err, rows: Route[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // 建立新路線
  static async create(routeData: CreateRouteRequest, userId: number): Promise<Route> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO routes (
          title, description, startLat, startLng, endLat, endLng, 
          distance, date, createdBy, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      db.run(sql, [
        routeData.title,
        routeData.description,
        routeData.startLat,
        routeData.startLng,
        routeData.endLat,
        routeData.endLng,
        routeData.distance || 0, // 預設距離為 0，後續會透過 Google Maps API 計算
        routeData.date,
        userId
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          const newRoute: Route = {
            id: this.lastID,
            title: routeData.title,
            description: routeData.description,
            startLat: routeData.startLat,
            startLng: routeData.startLng,
            endLat: routeData.endLat,
            endLng: routeData.endLng,
            distance: routeData.distance || 0,
            date: routeData.date,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          resolve(newRoute);
        }
      });
    });
  }

  // 更新路線
  static async update(id: number, routeData: UpdateRouteRequest, userId: number): Promise<Route | null> {
    return new Promise((resolve, reject) => {
      // 先檢查路線是否存在且屬於該使用者
      this.findById(id).then((route) => {
        if (!route) {
          resolve(null);
          return;
        }
        
        if (route.createdBy !== userId) {
          reject(new Error('無權限修改此路線'));
          return;
        }

        // 建立更新 SQL
        const updateFields = [];
        const values = [];
        
        if (routeData.title !== undefined) {
          updateFields.push('title = ?');
          values.push(routeData.title);
        }
        if (routeData.description !== undefined) {
          updateFields.push('description = ?');
          values.push(routeData.description);
        }
        if (routeData.startLat !== undefined) {
          updateFields.push('startLat = ?');
          values.push(routeData.startLat);
        }
        if (routeData.startLng !== undefined) {
          updateFields.push('startLng = ?');
          values.push(routeData.startLng);
        }
        if (routeData.endLat !== undefined) {
          updateFields.push('endLat = ?');
          values.push(routeData.endLat);
        }
        if (routeData.endLng !== undefined) {
          updateFields.push('endLng = ?');
          values.push(routeData.endLng);
        }
        if (routeData.date !== undefined) {
          updateFields.push('date = ?');
          values.push(routeData.date);
        }

        if (updateFields.length === 0) {
          resolve(route);
          return;
        }

        updateFields.push('updatedAt = datetime("now")');
        values.push(id);

        const sql = `UPDATE routes SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(sql, values, function(err) {
          if (err) {
            reject(err);
          } else {
            // 回傳更新後的路線
            RouteModel.findById(id).then(resolve).catch(reject);
          }
        });
      }).catch(reject);
    });
  }

  // 刪除路線
  static async delete(id: number, userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 先檢查路線是否存在且屬於該使用者
      this.findById(id).then((route) => {
        if (!route) {
          resolve(false);
          return;
        }
        
        if (route.createdBy !== userId) {
          reject(new Error('無權限刪除此路線'));
          return;
        }

        const sql = 'DELETE FROM routes WHERE id = ?';
        db.run(sql, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      }).catch(reject);
    });
  }

  // 檢查路線是否屬於指定使用者
  static async isOwner(routeId: number, userId: number): Promise<boolean> {
    const route = await this.findById(routeId);
    return route ? route.createdBy === userId : false;
  }
}





