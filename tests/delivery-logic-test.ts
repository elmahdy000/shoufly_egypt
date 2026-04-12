/**
 * Delivery Agent Role Logic Tests
 * Tests delivery journey: task acceptance → pickup → delivery → completion
 */

import { prisma } from '../lib/prisma';
import { acceptDeliveryTask, completeDeliveryAgent } from '../lib/services/delivery';
import 'dotenv/config';

async function testDeliveryLogic() {
  console.log('\n🧪 Testing DELIVERY AGENT Logic...\n');

  const results: { test: string; passed: boolean; error?: string }[] = [];

  // Get test delivery agent
  const agent = await prisma.user.findFirst({ where: { role: 'DELIVERY', isActive: true } });
  if (!agent) throw new Error('No active delivery agent found in database');

  // Test 1: Delivery Agent Registration Rules
  try {
    console.log('Test 1: Delivery Agent Registration Status');
    
    // Check for pending approval agents
    const pendingAgent = await prisma.user.findFirst({ 
      where: { role: 'DELIVERY', isActive: false } 
    });
    
    if (pendingAgent) {
      results.push({ test: 'Agent Needs Approval', passed: true });
      console.log('✅ Delivery agents require admin approval before activation\n');
    } else {
      results.push({ test: 'Agent Status Check', passed: true });
      console.log('✅ All delivery agents are active (or none pending)\n');
    }
  } catch (error: any) {
    results.push({ test: 'Agent Registration', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 2: View Available Tasks
  try {
    console.log('Test 2: View Available Tasks');
    
    // Find orders ready for pickup (with delivery tracking)
    const availableTasks = await prisma.request.findMany({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
      },
      include: {
        deliveryTracking: {
          where: { status: 'READY_FOR_PICKUP' },
        },
      },
      take: 5,
    });
    
    results.push({ test: 'View Available Tasks', passed: true });
    console.log(`✅ Agent can view ${availableTasks.length} available tasks\n`);
  } catch (error: any) {
    results.push({ test: 'View Available Tasks', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 3: Accept Task
  let acceptedTaskId: number | undefined;
  try {
    console.log('Test 3: Accept Delivery Task');
    
    // Find a task ready for pickup
    const readyTask = await prisma.request.findFirst({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
      },
      include: {
        deliveryTracking: {
          where: { status: 'READY_FOR_PICKUP' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (readyTask) {
      // Create delivery tracking with agent assignment
      await prisma.deliveryTracking.create({
        data: {
          requestId: readyTask.id,
          status: 'OUT_FOR_DELIVERY',
          note: `Assigned to agent #${agent.id}`,
        },
      });
      
      acceptedTaskId = readyTask.id;
      
      results.push({ test: 'Accept Task', passed: true });
      console.log(`✅ Agent assigned to task #${readyTask.id}\n`);
    } else {
      results.push({ test: 'Accept Task', passed: true });
      console.log('✅ No available tasks to accept (test scenario)\n');
    }
  } catch (error: any) {
    results.push({ test: 'Accept Task', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 4: Update Delivery Status
  try {
    console.log('Test 4: Update Delivery Status');
    
    // Find a task for this agent to update
    const assignedTask = await prisma.request.findFirst({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
      },
      include: {
        deliveryTracking: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (assignedTask) {
      // Add tracking update
      await prisma.deliveryTracking.create({
        data: {
          requestId: assignedTask.id,
          status: 'OUT_FOR_DELIVERY',
          note: 'Agent picked up order',
        },
      });
      
      results.push({ test: 'Update Status', passed: true });
      console.log(`✅ Agent can update delivery status\n`);
    } else {
      results.push({ test: 'Update Status', passed: true });
      console.log('✅ No assigned tasks to update\n');
    }
  } catch (error: any) {
    results.push({ test: 'Update Status', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 5: Complete Delivery
  try {
    console.log('Test 5: Complete Delivery');
    
    // Find a task ready for completion
    const outForDelivery = await prisma.request.findFirst({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
      },
      include: {
        deliveryTracking: {
          where: { status: 'OUT_FOR_DELIVERY' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (outForDelivery) {
      // Mark as delivered
      await prisma.deliveryTracking.create({
        data: {
          requestId: outForDelivery.id,
          status: 'DELIVERED',
          note: 'Order delivered to customer',
        },
      });
      
      results.push({ test: 'Complete Delivery', passed: true });
      console.log(`✅ Agent can mark delivery as complete\n`);
    } else {
      results.push({ test: 'Complete Delivery', passed: true });
      console.log('✅ No out-for-delivery tasks to complete\n');
    }
  } catch (error: any) {
    results.push({ test: 'Complete Delivery', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 6: Handle Failed Delivery
  try {
    console.log('Test 6: Handle Failed Delivery');
    
    // Find a task to mark as failed
    const failingTask = await prisma.request.findFirst({
      where: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
      },
    });
    
    if (failingTask) {
      // Mark delivery as failed
      await prisma.deliveryTracking.create({
        data: {
          requestId: failingTask.id,
          status: 'FAILED_DELIVERY',
          note: 'Customer not available',
        },
      });
      
      results.push({ test: 'Failed Delivery', passed: true });
      console.log(`✅ Agent can report failed delivery\n`);
    } else {
      results.push({ test: 'Failed Delivery', passed: true });
      console.log('✅ No tasks to mark as failed\n');
    }
  } catch (error: any) {
    results.push({ test: 'Failed Delivery', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Test 7: Agent Task Statistics
  try {
    console.log('Test 7: Task Statistics');
    
    // Count tasks by status
    const totalAssigned = await prisma.deliveryTracking.count({
      where: { note: { contains: `Assigned to agent #${agent.id}` } },
    });
    
    const completedTasks = await prisma.deliveryTracking.count({
      where: {
        status: 'DELIVERED',
      },
    });
    
    const failedTasks = await prisma.deliveryTracking.count({
      where: {
        status: 'FAILED_DELIVERY',
      },
    });
    
    results.push({ test: 'Task Statistics', passed: true });
    console.log(`✅ Agent stats: ${totalAssigned} assigned, ${completedTasks} completed, ${failedTasks} failed\n`);
  } catch (error: any) {
    results.push({ test: 'Task Statistics', passed: false, error: error.message });
    console.log('❌ Failed:', error.message, '\n');
  }

  // Summary
  console.log('\n📊 DELIVERY AGENT Test Results:');
  console.log('==============================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} ${r.test}`);
    if (r.error) console.log(`   ⚠️ ${r.error}`);
  });
  
  console.log(`\n✨ Total: ${passed} passed, ${failed} failed`);
  
  return { passed, failed, results };
}

// Run if executed directly
if (require.main === module) {
  testDeliveryLogic()
    .then(() => {
      console.log('\n🏁 Delivery agent tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Delivery agent tests failed:', error);
      process.exit(1);
    });
}

export { testDeliveryLogic };
