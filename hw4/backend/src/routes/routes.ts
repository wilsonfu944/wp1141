// 路線相關路由
import { Router, Request, Response } from 'express';
import { RouteModel } from '../models/Route';
import { googleMapsService } from '../services/googleMapsService';
import { authenticateToken } from '../middleware/auth';
import { validateCreateRoute, validateUpdateRoute } from '../middleware/validation';
import { CreateRouteRequest, UpdateRouteRequest, ApiResponse, Route } from '../types';

const router = Router();

// 所有路線相關路由都需要認證
router.use(authenticateToken);

// 取得使用者的所有路線
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const routes = await RouteModel.findByUserId(userId);

    res.json({
      success: true,
      data: routes,
      message: '路線列表取得成功'
    } as ApiResponse<Route[]>);

  } catch (error) {
    console.error('取得路線列表錯誤:', error);
    res.status(500).json({
      success: false,
      error: '取得路線列表失敗'
    } as ApiResponse);
  }
});

// 取得特定路線
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(routeId)) {
      return res.status(400).json({
        success: false,
        error: '無效的路線 ID'
      } as ApiResponse);
    }

    const route = await RouteModel.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: '找不到指定的路線'
      } as ApiResponse);
    }

    // 檢查權限
    if (route.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: '無權限存取此路線'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: route,
      message: '路線取得成功'
    } as ApiResponse<Route>);

  } catch (error) {
    console.error('取得路線錯誤:', error);
    res.status(500).json({
      success: false,
      error: '取得路線失敗'
    } as ApiResponse);
  }
});

// 建立新路線
router.post('/', validateCreateRoute, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const routeData: CreateRouteRequest = req.body;

    // 驗證座標
    if (!googleMapsService.validateCoordinates(routeData.startLat, routeData.startLng)) {
      return res.status(400).json({
        success: false,
        error: '起始座標無效'
      } as ApiResponse);
    }

    if (!googleMapsService.validateCoordinates(routeData.endLat, routeData.endLng)) {
      return res.status(400).json({
        success: false,
        error: '終點座標無效'
      } as ApiResponse);
    }

    // 計算距離
    let distance = 0;
    try {
      distance = await googleMapsService.calculateDistance(
        routeData.startLat,
        routeData.startLng,
        routeData.endLat,
        routeData.endLng
      );
    } catch (error) {
      console.error('計算距離失敗:', error);
      // 如果計算距離失敗，使用直線距離
      distance = googleMapsService.calculateStraightLineDistance(
        routeData.startLat,
        routeData.startLng,
        routeData.endLat,
        routeData.endLng
      );
    }

    // 建立路線
    const newRoute = await RouteModel.create(
      { ...routeData, distance },
      userId
    );

    res.status(201).json({
      success: true,
      data: newRoute,
      message: '路線建立成功'
    } as ApiResponse<Route>);

  } catch (error) {
    console.error('建立路線錯誤:', error);
    res.status(500).json({
      success: false,
      error: '建立路線失敗'
    } as ApiResponse);
  }
});

// 更新路線
router.put('/:id', validateUpdateRoute, async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id);
    const userId = req.user!.id;
    const updateData: UpdateRouteRequest = req.body;

    if (isNaN(routeId)) {
      return res.status(400).json({
        success: false,
        error: '無效的路線 ID'
      } as ApiResponse);
    }

    // 檢查路線是否存在
    const existingRoute = await RouteModel.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        error: '找不到指定的路線'
      } as ApiResponse);
    }

    // 檢查權限
    if (existingRoute.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: '無權限修改此路線'
      } as ApiResponse);
    }

    // 如果更新了座標，重新計算距離
    if (updateData.startLat !== undefined || updateData.startLng !== undefined ||
        updateData.endLat !== undefined || updateData.endLng !== undefined) {
      
      const startLat = updateData.startLat ?? existingRoute.startLat;
      const startLng = updateData.startLng ?? existingRoute.startLng;
      const endLat = updateData.endLat ?? existingRoute.endLat;
      const endLng = updateData.endLng ?? existingRoute.endLng;

      // 驗證座標
      if (!googleMapsService.validateCoordinates(startLat, startLng) ||
          !googleMapsService.validateCoordinates(endLat, endLng)) {
        return res.status(400).json({
          success: false,
          error: '座標無效'
        } as ApiResponse);
      }

      // 計算新距離
      try {
        const newDistance = await googleMapsService.calculateDistance(
          startLat, startLng, endLat, endLng
        );
        updateData.distance = newDistance;
      } catch (error) {
        console.error('計算距離失敗:', error);
        // 如果計算失敗，使用直線距離
        updateData.distance = googleMapsService.calculateStraightLineDistance(
          startLat, startLng, endLat, endLng
        );
      }
    }

    // 更新路線
    const updatedRoute = await RouteModel.update(routeId, updateData, userId);

    if (!updatedRoute) {
      return res.status(500).json({
        success: false,
        error: '更新路線失敗'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: updatedRoute,
      message: '路線更新成功'
    } as ApiResponse<Route>);

  } catch (error) {
    console.error('更新路線錯誤:', error);
    res.status(500).json({
      success: false,
      error: '更新路線失敗'
    } as ApiResponse);
  }
});

// 刪除路線
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(routeId)) {
      return res.status(400).json({
        success: false,
        error: '無效的路線 ID'
      } as ApiResponse);
    }

    // 檢查路線是否存在
    const existingRoute = await RouteModel.findById(routeId);
    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        error: '找不到指定的路線'
      } as ApiResponse);
    }

    // 檢查權限
    if (existingRoute.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: '無權限刪除此路線'
      } as ApiResponse);
    }

    // 刪除路線
    const deleted = await RouteModel.delete(routeId, userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: '刪除路線失敗'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: '路線刪除成功'
    } as ApiResponse);

  } catch (error) {
    console.error('刪除路線錯誤:', error);
    res.status(500).json({
      success: false,
      error: '刪除路線失敗'
    } as ApiResponse);
  }
});

export default router;





